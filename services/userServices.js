const bcrypt = require("bcryptjs");
const { signToken, tempToken } = require("../utils/jwt");
const User = require("../models/User");
const sendMail = require('../utils/email');

// Signin user (Login)
const getUser = async (email, password) => {
  const user = await User.findOne({ email }).select("+password");
  if (!user) throw new Error("User not found");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("Invalid credentials");

  const token = signToken({
    id: user._id,
    username: user.username,
    email: user.email,
    name: user.name,
  });

  return {
    token,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      name: user.name,
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
const createUser = async ({ username, email, password, name }) => {
  const existingUser = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (existingUser) throw new Error("User already exists");

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({
    username,
    email,
    name,
    password: hashedPassword,
  });

  const token = signToken({
    id: user._id,
    username: user.username,
    email: user.email,
    name: user.name,
  });

  return {
    token,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      name: user.name,
    },
  };
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

const { forgotPasswordTemplate } = require("../utils/emailTemplates");

// Generate temp reset token and send email
const forgotPassword = async (email) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("User not found");

  // generate JWT token, expires in 15 minutes
  const token = tempToken({ id: user._id, username: user.username });
  const subject = "Password reset link";
  const resetLink = `${process.env.FRONT_END_URL}/reset-password?token=${token}`;
  const message = `
      You requested a password reset.
  
      Click the link below to reset your password:
      ${resetLink}
  
      This link will expire in 15 minutes.
    `;

  const html = forgotPasswordTemplate(resetLink);
  // send token via email
  return await sendMail(email, subject, message, html);
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

module.exports = {
  getUser,
  reset,
  createUser,
  updateUser,
  forgotPassword,
  changePassword,
  getAllUsers,
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
