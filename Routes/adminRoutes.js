const express = require("express");
const router = express.Router();
const {
  loginAdminController,
  logoutAdminController,
  changePasswordController,
  forgotPasswordController,
} = require("../controllers/adminController");
const { verifyToken } = require("../middleware/authMiddleware");

/**
 * @route   POST /api/admin/login
 * @desc    Login admin and set cookie
 * @access  Public
 */
router.post("/login", loginAdminController);

/**
 * @route   POST /api/admin/logout
 * @desc    Logout admin and clear cookie
 * @access  Private
 */
router.post("/logout", verifyToken, logoutAdminController);

/**
 * @route   POST /api/admin/forgot-password
 * @desc    Request password reset link
 * @access  Public
 */
router.post("/forgot-password", forgotPasswordController);

/**
 * @route   PUT /api/admin/change-password
 * @desc    Change admin password
 * @access  Private (Requires valid JWT)
 */
router.put("/change-password", verifyToken, changePasswordController);

module.exports = router;
