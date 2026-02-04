const express = require("express");
const router = express.Router();
const {
    createOrderController,
    getAllOrdersController,
    getOrderByIdController,
    updateOrderController,
    deleteOrderController,
    getMyOrdersController
} = require("../controllers/orderController");
const { verifyToken, verifyAdminToken, verifyVerification } = require("../middleware/authMiddleware");

/**
 * @route   POST /api/orders
 * @desc    Create a new order
 * @access  Private (User)
 */
router.post("/", verifyToken, verifyVerification, createOrderController);

/**
 * @route   GET /api/orders
 * @desc    Get all orders (Admin)
 * @access  Private (Admin)
 */
router.get("/", verifyAdminToken, getAllOrdersController);

/**
 * @route   GET /api/orders/my-orders
 * @desc    Get logged-in user's orders
 * @access  Private (User)
 */
router.get("/my-orders", verifyToken, verifyVerification, getMyOrdersController);

/**
 * @route   GET /api/orders/:id
 * @desc    Get single order details
 * @access  Private (Admin or Owner)
 */
router.get("/:id", verifyToken, getOrderByIdController);

/**
 * @route   PATCH /api/orders/:id
 * @desc    Update an order (Status, etc.)
 * @access  Private (Admin)
 */
router.patch("/:id", verifyAdminToken, updateOrderController);

/**
 * @route   DELETE /api/orders/:id
 * @desc    Delete an order
 * @access  Private (Admin)
 */
router.delete("/:id", verifyAdminToken, deleteOrderController);

module.exports = router;
