const Order = require("../models/Order");
const Product = require("../models/Product");
const Store = require("../models/Store");
const User = require("../models/User");
const inventoryServices = require("./inventoryServices");
const { sendOrderConfirmation, sendOrderStatusUpdate, sendShippingNotification } = require("../utils/email");

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
        const finalPrice = (product.salePrice && product.salePrice > 0) ? product.salePrice : product.price;

        const itemTotal = finalPrice * item.quantity;
        calculatedSubtotal += itemTotal;

        orderItems.push({
            product: product._id,
            name: product.name,
            sku: product.sku,
            quantity: item.quantity,
            price: finalPrice,
            image: product.mainImage || product.images?.[0] || '/default-product.jpg'
        });
    }

    // 2. Calculate Shipping based on Store Config
    let shippingCost = 0;
    const storeConfig = await Store.findOne();

    const freeThreshold = storeConfig?.shipping?.freeThreshold || 50;
    const standardRate = storeConfig?.shipping?.standardRate || 10;

    if (calculatedSubtotal >= freeThreshold) {
        shippingCost = 0;
    } else {
        shippingCost = standardRate;
    }

    // 3. Calculate Final Total
    const tax = 0;
    const total = calculatedSubtotal + tax + shippingCost;

    // 4. Create Order
    const order = await Order.create({
        ...orderData,
        items: orderItems,
        subtotal: calculatedSubtotal,
        tax: tax,
        shippingCost: shippingCost,
        total: total
    });

    // 5. Update inventory after successful order creation
    try {
        await inventoryServices.updateMultipleProductStock(orderItems, 'decrease');
    } catch (inventoryError) {
        // If inventory update fails, we should rollback the order
        await Order.findByIdAndDelete(order._id);
        throw new Error(`Order creation failed due to inventory error: ${inventoryError.message}`);
    }

    // 6. Send order confirmation email
    try {
        const user = await User.findById(orderData.customer);
        if (user && user.email) {
            await sendOrderConfirmation(user.email, order);
        }
    } catch (emailError) {
        console.error('Failed to send order confirmation email:', emailError);
        // Don't fail the order creation if email fails
    }

    return order;
};

// Update order with email notifications
const updateOrder = async (id, updateData) => {
    const oldOrder = await Order.findById(id);
    if (!oldOrder) {
        throw new Error("Order not found");
    }

    const order = await Order.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
    });

    // Send email notifications for status changes
    try {
        const user = await User.findById(order.customer);
        if (user && user.email) {
            // If status changed, send status update email
            if (updateData.status && updateData.status !== oldOrder.status) {
                await sendOrderStatusUpdate(user.email, order);
            }

            // If tracking info added and status is shipped, send shipping notification
            if (updateData.tracking && updateData.status === 'Shipped') {
                await sendShippingNotification(user.email, order);
            }
        }
    } catch (emailError) {
        console.error('Failed to send order update email:', emailError);
        // Don't fail the update if email fails
    }

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
    const oldOrder = await Order.findById(id);
    if (!oldOrder) {
        throw new Error("Order not found");
    }

    const order = await Order.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
    });

    // Send email notifications for status changes
    try {
        const user = await User.findById(order.customer);
        if (user && user.email) {
            // If status changed, send status update email
            if (updateData.status && updateData.status !== oldOrder.status) {
                await sendOrderStatusUpdate(user.email, order);
            }

            // If tracking info added and status is shipped, send shipping notification
            if (updateData.tracking && updateData.status === 'Shipped') {
                await sendShippingNotification(user.email, order);
            }
        }
    } catch (emailError) {
        console.error('Failed to send order update email:', emailError);
        // Don't fail the update if email fails
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
