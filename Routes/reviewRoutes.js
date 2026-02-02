const express = require("express");
const router = express.Router({ mergeParams: true }); // Enable access to params from parent route
const {
    createReviewController,
    getAllReviewsController,
    getReviewByIdController,
    updateReviewController,
    deleteReviewController,
} = require("../controllers/reviewController");
const { verifyToken } = require("../middleware/authMiddleware");

/**
 * @route   GET /api/reviews
 * @desc    Get all reviews
 * @access  Public
 */
router.get("/", getAllReviewsController);

/**
 * @route   GET /api/reviews/:id
 * @desc    Get single review
 * @access  Public
 */
router.get("/:id", getReviewByIdController);

/**
 * @route   POST /api/reviews
 * @desc    Create a review (or POST /api/products/:productId/reviews)
 * @access  Private
 */
router.post("/", verifyToken, createReviewController);

/**
 * @route   PATCH /api/reviews/:id
 * @desc    Update a review
 * @access  Private (Owner/Admin)
 */
router.patch("/:id", verifyToken, updateReviewController);

/**
 * @route   DELETE /api/reviews/:id
 * @desc    Delete a review
 * @access  Private (Owner/Admin)
 */
router.delete("/:id", verifyToken, deleteReviewController);

module.exports = router;
