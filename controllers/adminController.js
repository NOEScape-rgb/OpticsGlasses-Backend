const AdminServices = require('../services/adminServices');

const loginAdminController = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        isStatus: false,
        msg: "Please provide email and password",
        data: null,
      });
    }

    const result = await AdminServices.getAdmin(email, password);

    // Helper to get cookie options based on environment/request
    const getCookieOptions = (req) => {
      const isSecure = req.secure || req.headers['x-forwarded-proto'] === 'https';
      return {
        httpOnly: true,
        secure: isSecure, // true on Vercel/HTTPS
        sameSite: isSecure ? "none" : "lax", // None required for cross-site
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: "/",
      };
    };

    const cookieOptions = getCookieOptions(req);
    console.log("SETTING ADMIN TOKEN COOKIE with options:", cookieOptions);
    res.cookie("adminToken", result.token, cookieOptions);

    res.status(200).json({
      isStatus: true,
      msg: "Login successfully",
      data: result.user
    });

  } catch (error) {
    // Handling specific service errors
    if (error.message === "Admin account not found") {
      return res.status(404).json({ isStatus: false, msg: error.message, data: null });
    }
    if (error.message === "Invalid credentials") {
      return res.status(401).json({ isStatus: false, msg: error.message, data: null });
    }

    console.error("Login Error:", error); // Good practice to log the actual error on server
    res.status(500).json({
      isStatus: false,
      msg: "Internal Server Error",
      data: null,
    });
  }
};

const logoutAdminController = (req, res) => {
  const isSecure = req.secure || req.headers['x-forwarded-proto'] === 'https';

  // When clearing cookies, options must match the set options (excluding maxAge/expires)
  res.clearCookie("adminToken", {
    httpOnly: true,
    secure: isSecure,
    sameSite: isSecure ? "none" : "lax",
    path: "/",
  });

  res.status(200).json({ isStatus: true, msg: "Logged out successfully", data: null });
};

const changePasswordController = async (req, res) => {
  try {
    const { password } = req.body;
    const AdminId = req.user && req.user.id;

    if (!AdminId) {
      return res.status(401).json({ isStatus: false, msg: "Unauthorized: User not authenticated", data: null });
    }
    if (!password) {
      return res.status(400).json({ isStatus: false, msg: "New password is required", data: null });
    }

    // FIX: Used 'AdminId' instead of the undefined 'userId'
    const user = await AdminServices.changePassword(AdminId, password);

    res.status(200).json({
      isStatus: true,
      msg: "Password successfully changed",
      data: { id: user._id, username: user.username, email: user.email, name: user.name },
    });
  } catch (error) {
    if (error.message === "User not found") {
      return res.status(404).json({ isStatus: false, msg: error.message, data: null });
    }
    res.status(500).json({ isStatus: false, msg: error.message || "Internal Server Error", data: null });
  }
};

const forgotPasswordController = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email)
      return res.status(400).json({ isStatus: false, msg: "Email required", data: null });

    // FIX: Capitalized AdminServices to match other controllers
    await AdminServices.forgotPassword(email);

    res.status(200).json({
      isStatus: true,
      msg: "If an admin with that email exists, a password reset link has been sent.",
      data: null,
    });
  } catch (error) {
    // Security: Handle "User not found" gracefully to prevent email enumeration
    if (error.message === "User not found") {
      return res.status(200).json({
        isStatus: true,
        msg: "If a user with that email exists, a password reset link has been sent.",
        data: null
      });
    }
    res.status(500).json({ isStatus: false, msg: error.message || "Internal Server Error", data: null });
  }
};

const getAdminProfileController = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(401).json({ isStatus: false, msg: "Unauthorized", data: null });
    }

    const Admin = require('../models/Admin');
    const admin = await Admin.findById(req.user.id).select("-password");

    if (!admin) {
      return res.status(404).json({ isStatus: false, msg: "Admin user not found", data: null });
    }

    res.status(200).json({
      isStatus: true,
      msg: "Admin profile retrieved successfully",
      data: admin
    });
  } catch (error) {
    res.status(500).json({ isStatus: false, msg: error.message || "Internal Server Error", data: null });
  }
};

// Don't forget to export them!
module.exports = {
  loginAdminController,
  logoutAdminController,
  changePasswordController,
  forgotPasswordController,
  getAdminProfileController
};