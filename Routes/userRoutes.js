const express = require("express");
const router = express.Router();
const {
  createUserController,
  getUserController,
  forgotPasswordController,
  resetPasswordUserController,
  logoutController,
  changePasswordController,
  getProfileController,
  updateUserController,
  updateMeController,
  getAllUsersController,
  verifyOTPController,
  resendOTPController
} = require("../controllers/userController");
const { verifyToken, verifyUser, verifyAdminToken } = require("../middleware/authMiddleware");

/**
 * @route   POST /api/users/signup
 * @desc    Register a new user
 * @access  Public
 */
router.post("/signup", createUserController);

/**
 * @route   POST /api/users/login
 * @desc    Login user and set cookie
 * @access  Public
 */
router.post("/login", getUserController);

/**
 * @route   POST /api/users/verify-otp
 * @desc    Verify OTP for account activation
 * @access  Public
 */
router.post("/verify-otp", verifyOTPController);

/**
 * @route   POST /api/users/resend-otp
 * @desc    Resend OTP code
 * @access  Public
 */
router.post("/resend-otp", resendOTPController);

/**
 * @route   POST /api/users/forgot-password
 * @desc    Request password reset link via email
 * @access  Public
 */
router.post("/forgot-password", forgotPasswordController);

/**
 * @route   PATCH /api/users/reset-password
 * @desc    Reset password using token from email
 * @access  Public (Token required)
 */
router.patch("/reset-password", resetPasswordUserController);

/**
 * @route   POST /api/users/logout
 * @desc    Logout user and clear cookie
 * @access  Private
 */
router.post("/logout", verifyToken, logoutController);

/**
 * @route   PATCH /api/users/change-password
 * @desc    Change password for logged-in user
 * @access  Private
 */
router.patch("/change-password", verifyToken, changePasswordController);

/**
 * @route   GET /api/users/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get("/me", verifyToken, getProfileController);

/**
 * @route   PATCH /api/users/update-me
 * @desc    Update current user profile
 * @access  Private
 */
router.patch("/update-me", verifyToken, updateMeController);

/**
 * @route   GET /api/users/
 * @desc    Get all users (Admin)
 * @access  Private (Admin)
 */
router.get("/", verifyAdminToken, getAllUsersController);

/**
 * @route   PATCH /api/users/:username
 * @desc    Update user profile by username
 * @access  Private (Self or Admin)
 */
router.patch("/:username", verifyToken, verifyUser, updateUserController);

module.exports = router;
