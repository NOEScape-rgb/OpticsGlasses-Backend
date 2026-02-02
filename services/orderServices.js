const Order = require("../models/Order");

// Create a new order
const createOrder = async (orderData) => {
    const order = await Order.create(orderData);
    return order;
};

// Get all orders with filtering, sorting, and pagination
const getAllOrders = async (queryString) => {
    // 1. Filtering
    const queryObj = { ...queryString };
    const excludedFields = ["page", "sort", "limit", "fields"];
    excludedFields.forEach((el) => delete queryObj[el]);

    // Advanced filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    let query = Order.find(JSON.parse(queryStr));

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

    const orders = await query;
    return orders;
};

// Get single order by ID
const getOrderById = async (id) => {
    const order = await Order.findById(id);
    if (!order) {
        throw new Error("Order not found");
    }
    return order;
};

// Update order (e.g., status, tracking)
const updateOrder = async (id, updateData) => {
    const order = await Order.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
    });
    if (!order) {
        throw new Error("Order not found");
    }
    return order;
};

// Delete order
const deleteOrder = async (id) => {
    const order = await Order.findByIdAndDelete(id);
    if (!order) {
        throw new Error("Order not found");
    }
    return order;
};

// Get orders by user ID
const getOrdersByUserId = async (userId) => {
    const orders = await Order.find({ customer: userId }).sort("-createdAt");
    return orders;
}

module.exports = {
    createOrder,
    getAllOrders,
    getOrderById,
    updateOrder,
    deleteOrder,
    getOrdersByUserId
};
