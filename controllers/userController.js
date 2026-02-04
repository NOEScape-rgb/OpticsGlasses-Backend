const cookieParser = require("cookie-parser");
const userServices = require("../services/userServices");
const jwt = require('jsonwebtoken');

// controller for signUp a user
const createUserController = async (req, res) => {
  try {
    const { username, email, password, name } = req.body; // Added 'name'
    if (!username || !email || !password || !name) // Added 'name' check
      return res
        .status(400)
        .json({
          isStatus: false,
          msg: "Please provide all required fields (username, email, password, name)",
          data: null,
        });
    const result = await userServices.createUser({ username, email, password, name });

    // Set HTTP-only cookie for automatic login after signup
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
    res.cookie("token", result.token, cookieOptions);

    res
      .status(201)
      .json({
        isStatus: true,
        msg: "User created successfully",
        data: result.user,
      });
  } catch (error) {
    if (error.message === "User already exists") {
      return res
        .status(409)
        .json({ isStatus: false, msg: error.message, data: null });
    }
    res
      .status(500)
      .json({
        isStatus: false,
        msg: error.message || "Internal Server Error",
        data: null,
      });
  }
};

//controller for updating user info
const updateUserController = async (req, res) => {
  try {
    const { username } = req.params;
    // We pass the entire body. Service handles filtering allowed fields.
    const user = await userServices.updateUser(username, req.body);

    res
      .status(200)
      .json({ isStatus: true, msg: "Updated successfully", data: user });
  } catch (error) {
    if (error.message === "User not found") {
      return res
        .status(404)
        .json({ isStatus: false, msg: error.message, data: null });
    }
    res
      .status(500)
      .json({ isStatus: false, msg: error.message || "Internal Server Error", data: null });
  }
};

// controller for resetting password using a temporary token (from forgot password flow)
const resetPasswordUserController = async (req, res) => {
  try {
    const { password } = req.body;
    const token = req.query.token || req.body.token; // Expect token from query params or body

    if (!token) {
      return res.status(401).json({
        isStatus: false,
        msg: "Unauthorized: No reset token provided.",
        data: null,
      });
    }

    if (!password) {
      return res.status(400).json({
        isStatus: false,
        msg: "New password is required",
        data: null,
      });
    }

    // Verify Token & Get User ID
    // Assuming 'JWT_SECRET' is used by utils/jwt for signing all tokens.
    // If tempToken uses a different secret, this needs to be adjusted.
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    const userId = decoded.id;

    if (!userId) {
      return res.status(403).json({
        isStatus: false,
        msg: "Invalid Token payload: User ID missing.",
        data: null,
      });
    }

    // Perform Password Change using the new service function
    await userServices.changePassword(userId, password);

    return res.status(200).json({
      isStatus: true,
      msg: "Password updated successfully",
      data: null,
    });

  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        isStatus: false,
        msg: "Password reset link has expired. Please request a new one.",
        data: null
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({
        isStatus: false,
        msg: "Invalid or malformed reset token.",
        data: null
      });
    }

    return res.status(500).json({
      isStatus: false,
      msg: error.message || "Internal Server Error",
      data: null,
    });
  }
};

// controller for logging in a user
const getUserController = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res
        .status(400)
        .json({
          isStatus: false,
          msg: "Please provide email and password",
          data: null,
        });
    const result = await userServices.getUser(email, password);

    // Set HTTP-only cookie
    // Helper to get cookie options based on environment/request (Duplicate logic for now or refactor to shared util)
    const getCookieOptions = (req) => {
      const isSecure = req.secure || req.headers['x-forwarded-proto'] === 'https';
      return {
        httpOnly: true,
        secure: isSecure,
        sameSite: isSecure ? "none" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: "/",
      };
    };

    const cookieOptions = getCookieOptions(req);
    console.log("SETTING TOKEN COOKIE with options:", cookieOptions);
    res.cookie("token", result.token, cookieOptions);

    res
      .status(200)
      .json({ isStatus: true, msg: "Login successfully", data: result.user });
  } catch (error) {
    if (error.message === "User not found") {
      return res
        .status(404)
        .json({ isStatus: false, msg: error.message, data: null });
    }
    if (error.message === "Invalid credentials") {
      return res
        .status(401)
        .json({ isStatus: false, msg: error.message, data: null });
    }
    res
      .status(500)
      .json({
        isStatus: false,
        msg: error.message || "Internal Server Error",
        data: null,
      });
  }
};

// controller for logging out a user
const logoutController = (req, res) => {
  const isSecure = req.secure || req.headers['x-forwarded-proto'] === 'https';
  res.clearCookie("token", {
    httpOnly: true,
    secure: isSecure,
    sameSite: isSecure ? "none" : "lax",
    path: "/",
  }); // Clear cookie with same options
  res
    .status(200)
    .json({ isStatus: true, msg: "Logged out successfully", data: null });
};

// Controller to initiate password reset (send email with link)
const forgotPasswordController = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email)
      return res.status(400).json({ isStatus: false, msg: "Email required", data: null });

    await userServices.forgotPassword(email);

    res.status(200).json({
      isStatus: true,
      msg: "If a user with that email exists, a password reset link has been sent.",
      data: null,
    });
  } catch (error) {
    // Be careful not to expose whether an email exists for security reasons
    if (error.message === "User not found") {
      return res.status(200).json({ // Still return 200 to prevent user enumeration
        isStatus: true,
        msg: "If a user with that email exists, a password reset link has been sent.",
        data: null
      });
    }
    res.status(500).json({ isStatus: false, msg: error.message || "Internal Server Error", data: null });
  }
};

// Controller for an authenticated user to change their password
const changePasswordController = async (req, res) => {
  try {
    const { password } = req.body;
    // Assuming req.user is populated by an authentication middleware
    const userId = req.user && req.user.id;

    if (!userId) {
      return res.status(401).json({ isStatus: false, msg: "Unauthorized: User not authenticated", data: null });
    }
    if (!password) {
      return res.status(400).json({ isStatus: false, msg: "New password is required", data: null });
    }

    const user = await userServices.changePassword(userId, password); // Call the new service function

    res.status(200).json({
      isStatus: true,
      msg: "Password successfully changed",
      data: { id: user._id, username: user.username, email: user.email, name: user.name }, // Return relevant user data
    });
  } catch (error) {
    if (error.message === "User not found") {
      return res.status(404).json({ isStatus: false, msg: error.message, data: null });
    }
    res.status(500).json({ isStatus: false, msg: error.message || "Internal Server Error", data: null });
  }
};

// This controller assumes an authentication middleware has populated req.user
const getProfileController = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        isStatus: false,
        msg: "Unauthorized: User not authenticated.",
        data: null
      });
    }

    const User = require("../models/User");
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        isStatus: false,
        msg: "User not found",
        data: null
      });
    }

    res.status(200).json({
      isStatus: true,
      msg: "User profile retrieved successfully",
      data: user
    });
  } catch (error) {
    res.status(500).json({
      isStatus: false,
      msg: error.message || "Internal Server Error",
      data: null
    });
  }
};

// Get All Users
const getAllUsersController = async (req, res) => {
  try {
    const users = await userServices.getAllUsers(req.query);
    res.status(200).json({
      isStatus: true,
      results: users.length,
      msg: "Users retrieved successfully",
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      isStatus: false,
      msg: error.message || "Internal Server Error",
      data: null,
    });
  }
};

module.exports = {
  createUserController,
  updateUserController,
  resetPasswordUserController,
  getUserController,
  logoutController,
  forgotPasswordController,
  getProfileController,
  changePasswordController,
  getAllUsersController
};
