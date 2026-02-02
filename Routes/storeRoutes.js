const express = require("express");
const router = express.Router();
const {
    getStoreConfigController,
    updateStoreConfigController,
    getPublicStoreConfigController
} = require("../controllers/storeController");
const { verifyToken } = require("../middleware/authMiddleware");

/**
 * @route   GET /api/store/public
 * @desc    Get public store settings (Shipping rates, SEO, etc.)
 * @access  Public
 */
router.get("/public", getPublicStoreConfigController);

/**
 * @route   GET /api/store
 * @desc    Get full store configuration
 * @access  Private (Admin)
 */
router.get("/", verifyToken, getStoreConfigController);

/**
 * @route   PATCH /api/store
 * @desc    Update store configuration
 * @access  Private (Admin)
 */
router.patch("/", verifyToken, updateStoreConfigController);

module.exports = router;
