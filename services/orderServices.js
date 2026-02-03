const Order = require("../models/Order");

const Product = require("../models/Product");
const Store = require("../models/Store");

// Create a new order with server-side calculation
const createOrder = async (orderData) => {
    const { items, shippingAddress, paymentMethod } = orderData;

    if (!items || items.length === 0) {
        throw new Error("Order must contain at least one item.");
    }

    let calculatedSubtotal = 0;
    const orderItems = [];

    // 1. Process each item: Fetch product, check stock, calculate price
    for (const item of items) {
        const product = await Product.findById(item.product);

        if (!product) {
            throw new Error(`Product not found: ${item.product}`);
        }

        // Stock Check
        if (product.stock < item.quantity) {
            throw new Error(`Insufficient stock for product: ${product.name}. Available: ${product.stock}`);
        }

        // Determine Price (Use Sale Price if active/exists)
        // Ensure to handle cases where salePrice might be 0 or undefined
        const finalPrice = (product.salePrice && product.salePrice > 0) ? product.salePrice : product.price;

        const itemTotal = finalPrice * item.quantity;
        calculatedSubtotal += itemTotal;

        orderItems.push({
            product: product._id,
            name: product.name,
            sku: product.sku,
            quantity: item.quantity,
            price: finalPrice
        });
    }

    // 2. Calculate Shipping based on Store Config
    let shippingCost = 0;
    const storeConfig = await Store.findOne(); // Singleton

    // Default fallback values if store config is messing
    const freeThreshold = storeConfig?.shipping?.freeThreshold || 50;
    const standardRate = storeConfig?.shipping?.standardRate || 10;

    if (calculatedSubtotal >= freeThreshold) {
        shippingCost = 0;
    } else {
        shippingCost = standardRate;
    }

    // 3. Calculate Final Total
    // Tax logic could be added here (e.g., from Store config or 3rd party)
    const tax = 0;
    const total = calculatedSubtotal + tax + shippingCost;

    // 4. Create Order
    const order = await Order.create({
        ...orderData, // Include customer, etc.
        items: orderItems, // Override items with secure ones
        subtotal: calculatedSubtotal, // Secure subtotal
        tax: tax,
        shippingCost: shippingCost, // Secure shipping
        total: total // Secure total
    });

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
