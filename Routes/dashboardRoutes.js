const express = require("express");
const router = express.Router();
const { getDashboardStats } = require("../controllers/dashboardController");
const { verifyAdmin } = require("../middleware/authMiddleware");

/**
 * @route   GET /api/dashboard/stats
 * @desc    Get aggregated stats for admin dashboard
 * @access  Private (Admin)
 */
router.get("/stats", verifyAdmin, getDashboardStats);

module.exports = router;
