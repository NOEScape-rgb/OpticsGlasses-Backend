const express = require("express");
const router = express.Router();
const {
    getStoreConfigController,
    updateStoreConfigController,
    getPublicStoreConfigController
} = require("../controllers/storeController");

// Import BOTH middlewares
const { verifyToken, verifyAdmin, verifyAdminToken } = require("../middleware/authMiddleware");

/**
 * @route   GET /api/store/public
 * @desc    Get public store settings
 * @access  Public
 */
router.get("/public", getPublicStoreConfigController);

/**
 * @route   GET /api/store
 * @desc    Get full store configuration
 * @access  Private (Admin)
 */
// 1. verifyAdminToken (Checks: Is this a valid ADMIN user?)
// 2. verifyAdmin (Checks: Is this user an Admin?)
// 3. Controller  (Action: Return data)
router.get("/", verifyAdminToken, verifyAdmin, getStoreConfigController);

/**
 * @route   PATCH /api/store
 * @desc    Update store configuration
 * @access  Private (Admin)
 */
router.patch("/", verifyAdminToken, verifyAdmin, updateStoreConfigController);
router.put("/", verifyAdminToken, verifyAdmin, updateStoreConfigController);
router.post("/", verifyAdminToken, verifyAdmin, updateStoreConfigController);

module.exports = router;