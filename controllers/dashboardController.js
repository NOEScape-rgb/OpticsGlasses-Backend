const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");
const Review = require("../models/Review");
const Coupon = require("../models/Coupon");

// Get Admin Dashboard Stats
const getDashboardStats = async (req, res) => {
    try {
        // 1. Total Sales & Revenue
        const salesStats = await Order.aggregate([
            { $match: { status: { $ne: "Cancelled" } } },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: "$total" },
                    totalOrders: { $sum: 1 },
                    avgOrderValue: { $avg: "$total" },
                },
            },
        ]);

        const income = salesStats.length > 0 ? salesStats[0].totalRevenue : 0;
        const countOrders = salesStats.length > 0 ? salesStats[0].totalOrders : 0;
        const avgOrderValue = salesStats.length > 0 ? salesStats[0].avgOrderValue : 0;

        // 2. Total Users
        const countUsers = await User.countDocuments();

        // 3. Total Products & Inventory Stats
        const countProducts = await Product.countDocuments();
        const lowStockProducts = await Product.countDocuments({ stock: { $lte: 5 }, status: { $ne: 'Draft' } });
        const outOfStockProducts = await Product.countDocuments({ status: 'Out of Stock' });

        // 4. Monthly Revenue (Last 12 months for chart)
        const dateLimit = new Date();
        dateLimit.setMonth(dateLimit.getMonth() - 12);

        const monthlyRevenue = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: dateLimit },
                    status: { $ne: "Cancelled" },
                },
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" }
                    },
                    revenue: { $sum: "$total" },
                    orders: { $sum: 1 },
                },
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]);

        // 5. Recent Orders (Last 10)
        const recentOrders = await Order.find()
            .sort({ createdAt: -1 })
            .limit(10)
            .populate("customer", "name email");

        // 6. Top Selling Products
        const topProducts = await Order.aggregate([
            { $match: { status: { $ne: "Cancelled" } } },
            { $unwind: "$items" },
            {
                $group: {
                    _id: "$items.product",
                    totalSold: { $sum: "$items.quantity" },
                    revenue: { $sum: { $multiply: ["$items.quantity", "$items.price"] } },
                    productName: { $first: "$items.name" },
                },
            },
            { $sort: { totalSold: -1 } },
            { $limit: 5 }
        ]);

        // 7. Order Status Distribution
        const orderStatusStats = await Order.aggregate([
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 },
                },
            },
        ]);

        // 8. Recent Reviews
        const recentReviews = await Review.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate("user", "name")
            .populate("product", "name");

        // 9. Active Coupons
        const activeCoupons = await Coupon.countDocuments({
            status: 'Active',
            expiresAt: { $gt: new Date() }
        });

        // 10. Today's Stats
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const todayStats = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: today, $lt: tomorrow },
                    status: { $ne: "Cancelled" }
                }
            },
            {
                $group: {
                    _id: null,
                    todayRevenue: { $sum: "$total" },
                    todayOrders: { $sum: 1 },
                }
            }
        ]);

        const todayRevenue = todayStats.length > 0 ? todayStats[0].todayRevenue : 0;
        const todayOrders = todayStats.length > 0 ? todayStats[0].todayOrders : 0;

        res.status(200).json({
            isStatus: true,
            msg: "Dashboard stats retrieved successfully",
            data: {
                // Overview Stats
                totalRevenue: income,
                totalOrders: countOrders,
                totalUsers: countUsers,
                totalProducts: countProducts,
                avgOrderValue,
                
                // Today's Stats
                todayRevenue,
                todayOrders,
                
                // Inventory Stats
                lowStockProducts,
                outOfStockProducts,
                activeCoupons,
                
                // Charts Data
                monthlyRevenue,
                orderStatusStats,
                
                // Lists
                recentOrders,
                topProducts,
                recentReviews,
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

// Get Sales Analytics
const getSalesAnalytics = async (req, res) => {
    try {
        const { period = '30' } = req.query; // days
        const daysBack = parseInt(period);
        
        const dateLimit = new Date();
        dateLimit.setDate(dateLimit.getDate() - daysBack);

        // Daily sales for the period
        const dailySales = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: dateLimit },
                    status: { $ne: "Cancelled" }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" },
                        day: { $dayOfMonth: "$createdAt" }
                    },
                    revenue: { $sum: "$total" },
                    orders: { $sum: 1 },
                    avgOrderValue: { $avg: "$total" }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } }
        ]);

        // Category performance
        const categoryPerformance = await Order.aggregate([
            { $match: { createdAt: { $gte: dateLimit }, status: { $ne: "Cancelled" } } },
            { $unwind: "$items" },
            {
                $lookup: {
                    from: "products",
                    localField: "items.product",
                    foreignField: "_id",
                    as: "productInfo"
                }
            },
            { $unwind: "$productInfo" },
            {
                $group: {
                    _id: "$productInfo.category",
                    revenue: { $sum: { $multiply: ["$items.quantity", "$items.price"] } },
                    quantity: { $sum: "$items.quantity" },
                    orders: { $sum: 1 }
                }
            },
            { $sort: { revenue: -1 } }
        ]);

        res.status(200).json({
            isStatus: true,
            msg: "Sales analytics retrieved successfully",
            data: {
                dailySales,
                categoryPerformance,
                period: daysBack
            }
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
    getSalesAnalytics,
};
