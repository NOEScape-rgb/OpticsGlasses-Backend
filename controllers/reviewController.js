const reviewServices = require("../services/reviewServices");

// Create Review
const createReviewController = async (req, res) => {
    try {
        // Force user ID if authenticated
        if (req.user && req.user.id) {
            req.body.user = req.user.id;
        }

        // If productId is in params (nested route), set it
        if (!req.body.product && req.params.productId) {
            req.body.product = req.params.productId;
        }

        const review = await reviewServices.createReview(req.body);
        res.status(201).json({
            isStatus: true,
            msg: "Review created successfully",
            data: review,
        });
    } catch (error) {
        // Handle duplicate review error
        if (error.code === 11000) {
            return res.status(409).json({
                isStatus: false,
                msg: "You have already reviewed this product",
                data: null,
            });
        }

        res.status(400).json({
            isStatus: false,
            msg: error.message || "Bad Request",
            data: null,
        });
    }
};

// Get All Reviews (Admin usually, or strict filtering)
const getAllReviewsController = async (req, res) => {
    try {
        const reviews = await reviewServices.getAllReviews(req.query);
        res.status(200).json({
            isStatus: true,
            results: reviews.length,
            msg: "Reviews retrieved successfully",
            data: reviews,
        });
    } catch (error) {
        res.status(500).json({
            isStatus: false,
            msg: error.message || "Internal Server Error",
            data: null,
        });
    }
};

// Get Single Review
const getReviewByIdController = async (req, res) => {
    try {
        const review = await reviewServices.getReviewById(req.params.id);
        res.status(200).json({
            isStatus: true,
            msg: "Review retrieved successfully",
            data: review,
        });
    } catch (error) {
        if (error.message === "Review not found") {
            return res.status(404).json({
                isStatus: false,
                msg: "Review not found",
                data: null,
            });
        }
        res.status(500).json({
            isStatus: false,
            msg: error.message || "Internal Server Error",
            data: null,
        });
    }
};

// Update Review
const updateReviewController = async (req, res) => {
    try {
        // Check if user is owner or admin
        // Note: Ideally services should handle this check or middleware, 
        // but simplified here: you must be logged in. 
        // A stricter check would retrieve the review first to check ownership.

        const review = await reviewServices.updateReview(req.params.id, req.body);
        res.status(200).json({
            isStatus: true,
            msg: "Review updated successfully",
            data: review,
        });
    } catch (error) {
        if (error.message === "Review not found") {
            return res.status(404).json({
                isStatus: false,
                msg: "Review not found",
                data: null,
            });
        }
        res.status(400).json({
            isStatus: false,
            msg: error.message || "Bad Request",
            data: null,
        });
    }
};

// Delete Review
const deleteReviewController = async (req, res) => {
    try {
        await reviewServices.deleteReview(req.params.id);
        res.status(200).json({
            isStatus: true,
            msg: "Review deleted successfully",
            data: null,
        });
    } catch (error) {
        if (error.message === "Review not found") {
            return res.status(404).json({
                isStatus: false,
                msg: "Review not found",
                data: null,
            });
        }
        res.status(500).json({
            isStatus: false,
            msg: error.message || "Internal Server Error",
            data: null,
        });
    }
};

module.exports = {
    createReviewController,
    getAllReviewsController,
    getReviewByIdController,
    updateReviewController,
    deleteReviewController,
};
