const express = require("express");
const router = express.Router();
const { getDashboardStats, getSalesAnalytics } = require("../controllers/dashboardController");
const { verifyAdminToken } = require("../middleware/authMiddleware");

/**
 * @route   GET /api/dashboard/stats
 * @desc    Get aggregated stats for admin dashboard
 * @access  Private (Admin)
 */
router.get("/stats", verifyAdminToken, getDashboardStats);

/**
 * @route   GET /api/dashboard/analytics
 * @desc    Get detailed sales analytics
 * @access  Private (Admin)
 */
router.get("/analytics", verifyAdminToken, getSalesAnalytics);

module.exports = router;
