const express = require("express");
const router = express.Router();

const userRoutes = require("./userRoutes");
const appRoutes = require("./appRoutes");
const adminRoutes = require("./adminRoutes");

const productRoutes = require("./productRoutes");
const ticketRoutes = require("./ticketRoutes");
const couponRoutes = require("./couponRoutes");
const orderRoutes = require("./orderRoutes");
const reviewRoutes = require("./reviewRoutes");
const storeRoutes = require("./storeRoutes");
const dashboardRoutes = require("./dashboardRoutes");
const uploadRoutes = require("./uploadRoutes");
const paymentMethodRoutes = require("./paymentMethodRoutes");
const paymentRoutes = require("./paymentRoutes");
const inventoryRoutes = require("./inventoryRoutes");
const searchRoutes = require("./searchRoutes");
const wishlistRoutes = require("./wishlistRoutes");

// Public or protected routes
router.use("/api/users", userRoutes);
router.use("/api/admin", adminRoutes);
router.use("/api/products", productRoutes);
router.use("/api/tickets", ticketRoutes);
router.use("/api/coupons", couponRoutes);
router.use("/api/orders", orderRoutes);
router.use("/api/reviews", reviewRoutes);
router.use("/api/store", storeRoutes);
router.use("/api/dashboard", dashboardRoutes);
router.use("/api/upload", uploadRoutes);
router.use("/api/payment-methods", paymentMethodRoutes);
router.use("/api/payments", paymentRoutes);
router.use("/api/inventory", inventoryRoutes);
router.use("/api/search", searchRoutes);
router.use("/api/wishlist", wishlistRoutes);
router.use("/", appRoutes);


module.exports = router;