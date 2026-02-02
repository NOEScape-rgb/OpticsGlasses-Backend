const orderServices = require("../services/orderServices");

// Create Order
const createOrderController = async (req, res) => {
    try {
        // If the user is authenticated, force the customer field to their ID
        if (req.user && req.user.id) {
            req.body.customer = req.user.id;
        }

        // Note: If you want to allow anonymous orders, you'd need logic here to handle guest customers.
        // For now, assuming the model constraint "Order must belong to a User" holds.

        const order = await orderServices.createOrder(req.body);
        res.status(201).json({
            isStatus: true,
            msg: "Order created successfully",
            data: order,
        });
    } catch (error) {
        res.status(400).json({
            isStatus: false,
            msg: error.message || "Bad Request",
            data: null,
        });
    }
};

// Get All Orders (Admin)
const getAllOrdersController = async (req, res) => {
    try {
        const orders = await orderServices.getAllOrders(req.query);
        res.status(200).json({
            isStatus: true,
            results: orders.length,
            msg: "Orders retrieved successfully",
            data: orders,
        });
    } catch (error) {
        res.status(500).json({
            isStatus: false,
            msg: error.message || "Internal Server Error",
            data: null,
        });
    }
};

// Get Single Order
const getOrderByIdController = async (req, res) => {
    try {
        const order = await orderServices.getOrderById(req.params.id);

        // Authorization Check:
        // Ensure the user requesting looking at the order is the owner OR an admin
        if (req.user.role !== 'admin' && order.customer._id.toString() !== req.user.id) {
            return res.status(403).json({
                isStatus: false,
                msg: "Unauthorized to view this order",
                data: null,
            });
        }

        res.status(200).json({
            isStatus: true,
            msg: "Order retrieved successfully",
            data: order,
        });
    } catch (error) {
        if (error.message === "Order not found") {
            return res.status(404).json({
                isStatus: false,
                msg: "Order not found",
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

// Update Order (Admin mostly, or maybe user cancelling)
const updateOrderController = async (req, res) => {
    try {
        const order = await orderServices.updateOrder(req.params.id, req.body);
        res.status(200).json({
            isStatus: true,
            msg: "Order updated successfully",
            data: order,
        });
    } catch (error) {
        if (error.message === "Order not found") {
            return res.status(404).json({
                isStatus: false,
                msg: "Order not found",
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

// Delete Order (Admin)
const deleteOrderController = async (req, res) => {
    try {
        await orderServices.deleteOrder(req.params.id);
        res.status(200).json({
            isStatus: true,
            msg: "Order deleted successfully",
            data: null,
        });
    } catch (error) {
        if (error.message === "Order not found") {
            return res.status(404).json({
                isStatus: false,
                msg: "Order not found",
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

// Get My Orders (for logged-in user)
const getMyOrdersController = async (req, res) => {
    try {
        const userId = req.user.id;
        const orders = await orderServices.getOrdersByUserId(userId);
        res.status(200).json({
            isStatus: true,
            results: orders.length,
            msg: "User orders retrieved successfully",
            data: orders,
        });
    } catch (error) {
        res.status(500).json({
            isStatus: false,
            msg: error.message || "Internal Server Error",
            data: null,
        });
    }
}

module.exports = {
    createOrderController,
    getAllOrdersController,
    getOrderByIdController,
    updateOrderController,
    deleteOrderController,
    getMyOrdersController
};
