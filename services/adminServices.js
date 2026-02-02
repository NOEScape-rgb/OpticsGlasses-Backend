const bcrypt = require("bcryptjs");
const { signToken, tempToken } = require("../utils/jwt");
const Admin = require("../models/Admin");
const sendMail = require('../utils/email');

// Admin Login
const getAdmin = async (email, password) => {
  // 1. Check if admin exists in Admin collection
  const admin = await Admin.findOne({ email });

  // ERROR MESSAGE MUST MATCH CONTROLLER: "Admin account not found"
  if (!admin) throw new Error("Admin account not found");

  // 2. Check password
  const isMatch = await bcrypt.compare(password, admin.password);

  // ERROR MESSAGE MUST MATCH CONTROLLER: "Invalid credentials"
  if (!isMatch) throw new Error("Invalid credentials");

  // 3. Sign Token
  const token = signToken({
    id: admin._id,
    role: "admin",
    email: admin.email,
    name: admin.name,
  });

  // 4. Return format expected by controller
  return {
    token,
    user: {
      id: admin._id,
      username: admin.username,
      email: admin.email,
      name: admin.name,
      role: "admin",
      avatarUrl: admin.avatarUrl
    },
  };
};

const { forgotPasswordTemplate } = require("../utils/emailTemplates");

// Forgot Password (Send Reset Email)
const forgotPassword = async (email) => {
  const admin = await Admin.findOne({ email });

  // Controller handles this error securely, but we must throw it here
  if (!admin) throw new Error("User not found");

  // Generate temp token (valid for 15 mins)
  const token = tempToken({ id: admin._id, role: "admin" });

  const subject = "Admin Password Reset Request";

  // Note: Point this to your ADMIN frontend route, not the user one
  const resetLink = `${process.env.FRONT_END_URL}/admin/reset-password?token=${token}`;
  const message = `
      Admin Password Reset
      You requested a password reset for your administrator account.
      Click the link below to reset your password:
      ${resetLink}
      This link will expire in 15 minutes.
    `;

  const html = forgotPasswordTemplate(resetLink);

  // Ensure sendMail is functional
  return await sendMail(email, subject, message, html);
};

// Change Password (Authenticated)
const changePassword = async (adminId, newPassword) => {
  const admin = await Admin.findById(adminId);
  if (!admin) throw new Error("User not found");

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  admin.password = hashedPassword;
  await admin.save();

  return admin;
};

module.exports = {
  getAdmin,
  forgotPassword,
  changePassword,
};