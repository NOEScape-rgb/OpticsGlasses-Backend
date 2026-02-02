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
  getAllUsersController
} = require("../controllers/userController");
const { verifyUser } = require("../middleware/authMiddleware");

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
router.post("/logout", verifyUser, logoutController);

/**
 * @route   PATCH /api/users/change-password
 * @desc    Change password for logged-in user
 * @access  Private
 */
router.patch("/change-password", verifyUser, changePasswordController);

/**
 * @route   GET /api/users/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get("/me", verifyUser, getProfileController);

/**
 * @route   GET /api/users/
 * @desc    Get all users (admin filtered usually, but public for now as per request)
 * @access  Public
 */
router.get("/", getAllUsersController);

/**
 * @route   PATCH /api/users/:username
 * @desc    Update user profile by username
 * @access  Private (Self or Admin)
 */
router.patch("/:username", verifyUser, updateUserController);

module.exports = router;
