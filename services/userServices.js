const bcrypt = require("bcryptjs");
const { signToken, tempToken } = require("../utils/jwt");
const User = require("../models/User");
const { sendMail, sendWelcomeEmail, sendPasswordResetEmail, sendOTPEmail } = require('../utils/email');
const { sendSMS, sendOTPSMS, sendWelcomeSMS } = require('../utils/sms');

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Signin user (Login)
const getUser = async (identifier, password) => {
  // identifier can be either email or phone
  const user = await User.findOne({
    $or: [{ email: identifier }, { phone: identifier }]
  }).select("+password");

  if (!user) throw new Error("User not found");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("Invalid credentials");

  // Check verification status - explicit check for false
  // Legacy users without isVerified field are treated as verified
  if (user.isVerified === false) {
    throw new Error("UNVERIFIED_ACCOUNT");
  }

  const token = signToken({
    id: user._id,
    username: user.username,
    email: user.email,
    name: user.name,
    phone: user.phone,
  });

  return {
    token,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      name: user.name,
      phone: user.phone,
    },
  };
};

// Resetting user password (Direct update by username)
const reset = async (username, password) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.findOneAndUpdate(
    { username },
    { password: hashedPassword },
    { new: true },
  );
  if (!user) throw new Error("User not found");
  return user;
};

// Create new user (Signup)
const createUser = async ({ username, email, password, name, phone }) => {
  const existingUser = await User.findOne({
    $or: [{ email }, { username }, { phone }],
  });

  if (existingUser) {
    if (existingUser.email === email) throw new Error("Email already registered");
    if (existingUser.phone === phone) throw new Error("Phone number already registered");
    if (existingUser.username === username) throw new Error("Username already taken");
    throw new Error("User already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const otp = generateOTP();
  const otpExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  const user = await User.create({
    username,
    email,
    name,
    phone,
    password: hashedPassword,
    otp,
    otpExpires,
    isVerified: false,
  });

  // Send OTP notifications to both email and phone
  try {
    const promises = [];
    if (user.email) {
      promises.push(sendOTPEmail(user.email, otp));
    }
    if (user.phone) {
      promises.push(sendOTPSMS(user.phone, otp));
    }
    await Promise.allSettled(promises);
  } catch (notificationError) {
    console.error('Failed to send OTP notifications:', notificationError);
  }

  return {
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      name: user.name,
      phone: user.phone,
      isVerified: user.isVerified
    },
  };
};

const verifyOTP = async (identifier, otp) => {
  // identifier can be either email or phone
  const user = await User.findOne({
    $or: [{ email: identifier }, { phone: identifier }]
  }).select("+otp +otpExpires");

  if (!user) throw new Error("User not found");

  if (user.isVerified) throw new Error("User is already verified");

  if (!user.otp || user.otp !== otp) throw new Error("Invalid verification code");

  if (new Date() > user.otpExpires) throw new Error("Verification code has expired");

  user.isVerified = true;
  user.otp = undefined;
  user.otpExpires = undefined;
  await user.save();

  const token = signToken({
    id: user._id,
    username: user.username,
    email: user.email,
    name: user.name,
    phone: user.phone,
  });

  // Send welcome message to both email and phone
  try {
    await Promise.allSettled([
      sendWelcomeEmail(user.email, { name: user.name, email: user.email }),
      sendWelcomeSMS(user.phone, { name: user.name })
    ]);
  } catch (err) {
    console.error("Welcome notifications failed after verification:", err);
  }

  return {
    token,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      name: user.name,
      phone: user.phone,
    },
  };
};

const resendOTP = async (identifier) => {
  const user = await User.findOne({
    $or: [{ email: identifier }, { phone: identifier }]
  });
  if (!user) throw new Error("User not found");

  if (user.isVerified) throw new Error("User is already verified");

  const otp = generateOTP();
  const otpExpires = new Date(Date.now() + 15 * 60 * 1000);

  user.otp = otp;
  user.otpExpires = otpExpires;
  await user.save();

  try {
    const promises = [];
    if (user.email) promises.push(sendOTPEmail(user.email, otp));
    if (user.phone) promises.push(sendOTPSMS(user.phone, otp));
    await Promise.allSettled(promises);
  } catch (notificationError) {
    console.error('Failed to resend OTP notifications:', notificationError);
    throw new Error("Failed to send code, please try again later");
  }

  return true;
};

const updateUser = async (username, updateData) => {
  // Security: Prevent updating sensitive fields like password or role through this route
  delete updateData.password;
  delete updateData.isAdmin;
  delete updateData.email; // Usually email updates require verification, keeping strict for now or allow if needed.
  delete updateData.username; // Username usually shouldn't change easily

  const user = await User.findOneAndUpdate(
    { username },
    updateData,
    { new: true, runValidators: true },
  );

  if (!user) throw new Error("User not found");
  return user;
};

// Generate temp reset token and send email
const forgotPassword = async (email) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("User not found");

  // generate JWT token, expires in 15 minutes
  const token = tempToken({ id: user._id, username: user.username });
  const resetLink = `${process.env.FRONT_END_URL}/reset-password?token=${token}`;

  // Send password reset email using new template
  return await sendPasswordResetEmail(email, { resetLink });
};

// Securely change password
const changePassword = async (userId, newPassword) => {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedPassword;
  await user.save();

  return user;
};

// Get all users with filtering, sorting, and pagination
const getAllUsers = async (queryString) => {
  // 1. Filtering
  // Create a shallow copy of query object
  const queryObj = { ...queryString };
  const excludedFields = ["page", "sort", "limit", "fields"];
  excludedFields.forEach((el) => delete queryObj[el]);

  // Advanced filtering (gte, gt, lte, lt)
  let queryStr = JSON.stringify(queryObj);
  queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

  let query = User.find(JSON.parse(queryStr));

  // 2. Sorting
  if (queryString.sort) {
    const sortBy = queryString.sort.split(",").join(" ");
    query = query.sort(sortBy);
  } else {
    query = query.sort("-createdAt"); // Default sort by newest
  }

  // 3. Field Limiting
  if (queryString.fields) {
    const fields = queryString.fields.split(",").join(" ");
    query = query.select(fields);
  } else {
    query = query.select("-__v");
  }

  // 4. Pagination
  const page = queryString.page * 1 || 1;
  const limit = queryString.limit * 1 || 20; // Default limit 20
  const skip = (page - 1) * limit;

  query = query.skip(skip).limit(limit);

  const users = await query;
  return users;
};

module.exports = {
  getUser,
  reset,
  createUser,
  updateUser,
  forgotPassword,
  changePassword,
  getAllUsers,
  verifyOTP,
  resendOTP,
};
