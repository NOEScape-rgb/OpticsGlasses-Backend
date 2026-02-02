const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");

// Get Admin Dashboard Stats
const getDashboardStats = async (req, res) => {
    try {
        // 1. Total Sales & Revenue
        // Aggregate all orders that are not cancelled
        const salesStats = await Order.aggregate([
            { $match: { status: { $ne: "Cancelled" } } },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: "$total" },
                    totalOrders: { $sum: 1 },
                },
            },
        ]);

        const income = salesStats.length > 0 ? salesStats[0].totalRevenue : 0;
        const countOrders = salesStats.length > 0 ? salesStats[0].totalOrders : 0;

        // 2. Total Users
        const countUsers = await User.countDocuments();

        // 3. Total Products
        const countProducts = await Product.countDocuments();

        // 4. Monthly Income (Last 6 months for chart)
        const dateLimit = new Date();
        dateLimit.setMonth(dateLimit.getMonth() - 6);

        const monthlyIncome = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: dateLimit },
                    status: { $ne: "Cancelled" },
                },
            },
            {
                $group: {
                    _id: { $month: "$createdAt" },
                    total: { $sum: "$total" },
                },
            },
            { $sort: { _id: 1 } } // Sort by month
        ]);

        // 5. Recent Orders (Last 5)
        const recentOrders = await Order.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate("customer", "name email");

        res.status(200).json({
            isStatus: true,
            msg: "Dashboard stats retrieved successfully",
            data: {
                totalRevenue: income,
                totalOrders: countOrders,
                totalUsers: countUsers,
                totalProducts: countProducts,
                monthlyIncome,
                recentOrders,
            },
        });
    } catch (error) {
        res.status(500).json({
            isStatus: false,
            msg: error.message || "Internal Server Error",
            data: null,
        });
    }
};

module.exports = {
    getDashboardStats,
};
