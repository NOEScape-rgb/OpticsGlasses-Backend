const express = require("express");
const router = express.Router();
const {
    createCouponController,
    getAllCouponsController,
    getCouponByIdController,
    updateCouponController,
    deleteCouponController,
    validateCouponController
} = require("../controllers/couponController");
const { verifyToken } = require("../middleware/authMiddleware");

/**
 * @route   POST /api/coupons/validate
 * @desc    Check if a coupon code is valid for a given order amount
 * @access  Public (Used during checkout)
 */
router.post("/validate", validateCouponController);

/**
 * @route   GET /api/coupons
 * @desc    Get all coupons (Admin)
 * @access  Private
 */
router.get("/", verifyToken, getAllCouponsController);

/**
 * @route   GET /api/coupons/:id
 * @desc    Get single coupon details (Admin)
 * @access  Private
 */
router.get("/:id", verifyToken, getCouponByIdController);

/**
 * @route   POST /api/coupons
 * @desc    Create a new coupon (Admin)
 * @access  Private
 */
router.post("/", verifyToken, createCouponController);

/**
 * @route   PATCH /api/coupons/:id
 * @desc    Update a coupon (Admin)
 * @access  Private
 */
router.patch("/:id", verifyToken, updateCouponController);

/**
 * @route   DELETE /api/coupons/:id
 * @desc    Delete a coupon (Admin)
 * @access  Private
 */
router.delete("/:id", verifyToken, deleteCouponController);

module.exports = router;
