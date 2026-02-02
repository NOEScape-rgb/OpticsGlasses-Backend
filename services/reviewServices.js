const Review = require("../models/Review");

// Create a new review
const createReview = async (reviewData) => {
    const review = await Review.create(reviewData);
    return review;
};

// Get all reviews with filtering, sorting, and pagination
const getAllReviews = async (queryString) => {
    // 1. Filtering
    const queryObj = { ...queryString };
    const excludedFields = ["page", "sort", "limit", "fields"];
    excludedFields.forEach((el) => delete queryObj[el]);

    // Advanced filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    let query = Review.find(JSON.parse(queryStr));

    // 2. Sorting
    if (queryString.sort) {
        const sortBy = queryString.sort.split(",").join(" ");
        query = query.sort(sortBy);
    } else {
        query = query.sort("-createdAt");
    }

    // 3. Field Limiting
    if (queryString.fields) {
        const fields = queryString.fields.split(",").join(" ");
        query = query.select(fields);
    } else {
        query = query.select("-__v");
    }

    // 4. Pagination
    const page = queryString.page * 1 || 1;
    const limit = queryString.limit * 1 || 20;
    const skip = (page - 1) * limit;

    query = query.skip(skip).limit(limit);

    const reviews = await query;
    return reviews;
};

// Get single review by ID
const getReviewById = async (id) => {
    const review = await Review.findById(id);
    if (!review) {
        throw new Error("Review not found");
    }
    return review;
};

// Update review
const updateReview = async (id, updateData) => {
    const review = await Review.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
    });
    if (!review) {
        throw new Error("Review not found");
    }
    return review;
};

// Delete review
const deleteReview = async (id) => {
    const review = await Review.findByIdAndDelete(id);
    if (!review) {
        throw new Error("Review not found");
    }
    return review;
};

// Get reviews for a specific product
const getReviewsByProductId = async (productId) => {
    const reviews = await Review.find({ product: productId, status: "Approved" }).sort("-createdAt");
    return reviews;
}

module.exports = {
    createReview,
    getAllReviews,
    getReviewById,
    updateReview,
    deleteReview,
    getReviewsByProductId,
};
