const couponServices = require("../services/couponServices");

// Create Coupon
const createCouponController = async (req, res) => {
    try {
        const coupon = await couponServices.createCoupon(req.body);
        res.status(201).json({
            isStatus: true,
            msg: "Coupon created successfully",
            data: coupon,
        });
    } catch (error) {
        if (error.code === 11000) { // Duplicate key error code for MongoDB
            return res.status(409).json({
                isStatus: false,
                msg: "Coupon code already exists",
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

// Get All Coupons
const getAllCouponsController = async (req, res) => {
    try {
        const coupons = await couponServices.getAllCoupons(req.query);
        res.status(200).json({
            isStatus: true,
            results: coupons.length,
            msg: "Coupons retrieved successfully",
            data: coupons,
        });
    } catch (error) {
        res.status(500).json({
            isStatus: false,
            msg: error.message || "Internal Server Error",
            data: null,
        });
    }
};

// Get Single Coupon
const getCouponByIdController = async (req, res) => {
    try {
        const coupon = await couponServices.getCouponById(req.params.id);
        res.status(200).json({
            isStatus: true,
            msg: "Coupon retrieved successfully",
            data: coupon,
        });
    } catch (error) {
        if (error.message === "Coupon not found") {
            return res.status(404).json({
                isStatus: false,
                msg: "Coupon not found",
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

// Update Coupon
const updateCouponController = async (req, res) => {
    try {
        const coupon = await couponServices.updateCoupon(req.params.id, req.body);
        res.status(200).json({
            isStatus: true,
            msg: "Coupon updated successfully",
            data: coupon,
        });
    } catch (error) {
        if (error.message === "Coupon not found") {
            return res.status(404).json({
                isStatus: false,
                msg: "Coupon not found",
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

// Delete Coupon
const deleteCouponController = async (req, res) => {
    try {
        await couponServices.deleteCoupon(req.params.id);
        res.status(200).json({
            isStatus: true,
            msg: "Coupon deleted successfully",
            data: null,
        });
    } catch (error) {
        if (error.message === "Coupon not found") {
            return res.status(404).json({
                isStatus: false,
                msg: "Coupon not found",
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

// Validate Coupon (For checkout)
const validateCouponController = async (req, res) => {
    try {
        const { code, orderAmount } = req.body;
        if (!code || orderAmount === undefined) {
            return res.status(400).json({
                isStatus: false,
                msg: "Coupon code and order amount are required",
                data: null,
            });
        }

        const coupon = await couponServices.validateCoupon(code, orderAmount);

        res.status(200).json({
            isStatus: true,
            msg: "Coupon is valid",
            data: coupon,
        });

    } catch (error) {
        // Return 200 even for invalid coupons so frontend can display message nicely? 
        // Or 400? Usually 400 is better for invalid input logic.
        return res.status(400).json({
            isStatus: false,
            msg: error.message,
            data: null,
        });
    }
}

module.exports = {
    createCouponController,
    getAllCouponsController,
    getCouponByIdController,
    updateCouponController,
    deleteCouponController,
    validateCouponController,
};
