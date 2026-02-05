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
const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { authenticate } = require("../middleware/auth");

// Public routes
router.post("/signup", userController.createUserController);
router.post("/login", userController.getUserController);
router.post("/logout", userController.logoutController);
router.post("/forgot-password", userController.forgotPasswordController);
router.post("/reset-password", userController.resetPasswordUserController);

// OTP verification routes
router.post("/verify-otp", userController.verifyOTPController);
router.post("/resend-otp", userController.resendOTPController);

// Protected routes (require authentication)
router.use(authenticate); // All routes below require authentication

router.get("/profile", userController.getProfileController);
router.patch("/update-me", userController.updateMeController);
router.patch("/change-password", userController.changePasswordController);
router.patch("/:username", userController.updateUserController);

// Admin routes
router.get("/", userController.getAllUsersController);

module.exports = router;
/**
 * @route   POST /api/users/signup
 * @desc    Register a new user
 * @access  Public
 */
router.post("/signup", createUserController);
router.post("/verify-otp", verifyOTPController);
router.post("/resend-otp", resendOTPController);

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
