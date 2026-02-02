const Coupon = require("../models/Coupon");

// Create a new coupon
const createCoupon = async (couponData) => {
    const coupon = await Coupon.create(couponData);
    return coupon;
};

// Get all coupons with filtering, sorting, and pagination
const getAllCoupons = async (queryString) => {
    // 1. Filtering
    const queryObj = { ...queryString };
    const excludedFields = ["page", "sort", "limit", "fields"];
    excludedFields.forEach((el) => delete queryObj[el]);

    // Advanced filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    let query = Coupon.find(JSON.parse(queryStr));

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

    const coupons = await query;
    return coupons;
};

// Get single coupon by ID
const getCouponById = async (id) => {
    const coupon = await Coupon.findById(id);
    if (!coupon) {
        throw new Error("Coupon not found");
    }
    return coupon;
};

// Update coupon
const updateCoupon = async (id, updateData) => {
    const coupon = await Coupon.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
    });
    if (!coupon) {
        throw new Error("Coupon not found");
    }
    return coupon;
};

// Delete coupon
const deleteCoupon = async (id) => {
    const coupon = await Coupon.findByIdAndDelete(id);
    if (!coupon) {
        throw new Error("Coupon not found");
    }
    return coupon;
};

// Validate a coupon functionality
const validateCoupon = async (code, orderAmount) => {
    const coupon = await Coupon.findOne({ code, status: "Active" });

    if (!coupon) {
        throw new Error("Invalid or inactive coupon");
    }

    if (!coupon.isActive()) {
        throw new Error("Coupon is expired or fully used");
    }

    if (coupon.minOrder > 0 && orderAmount < coupon.minOrder) {
        throw new Error(`Minimum order amount of ${coupon.minOrder} required`);
    }

    return coupon;
};

module.exports = {
    createCoupon,
    getAllCoupons,
    getCouponById,
    updateCoupon,
    deleteCoupon,
    validateCoupon,
};
