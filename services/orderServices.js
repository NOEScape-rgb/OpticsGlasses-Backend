const Order = require("../models/Order");
const Product = require("../models/Product");
const Store = require("../models/Store");
const User = require("../models/User");
const Coupon = require("../models/Coupon");
const inventoryServices = require("./inventoryServices");
const couponServices = require("./couponServices");
const { sendOrderConfirmation, sendOrderStatusUpdate, sendShippingNotification } = require("../utils/email");
const { sendOrderConfirmationSMS, sendOrderStatusSMS, sendShippingSMS } = require("../utils/sms");

// Create a new order with server-side calculation
const createOrder = async (orderData) => {
    const { items, shippingAddress, paymentMethod, couponCode } = orderData;

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

    // 1.5. Update User's Shipping Address (Auto-save)
    // 1.5. Update User's Shipping Address & Phone (Auto-save)
    if (orderData.customer) {
        try {
            const updates = {};
            if (shippingAddress) updates.shippingAddress = shippingAddress;
            if (orderData.phone) {
                let p = orderData.phone.replace(/\D/g, '');
                if (p.startsWith('92')) p = '+' + p;
                else if (p.startsWith('03')) p = '+92' + p.substring(1);
                else if (p.length === 10 && p.startsWith('3')) p = '+92' + p;
                updates.phone = p;
            }

            if (Object.keys(updates).length > 0) {
                await User.findByIdAndUpdate(
                    orderData.customer,
                    { $set: updates },
                    { new: true, runValidators: true }
                );
            }
        } catch (err) {
            console.error("Failed to auto-save user details:", err);
            // Non-critical, continue with order
        }
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

    // 3. Calculate Discount (if coupon provided)
    let discount = 0;
    let appliedCoupon = null;

    if (couponCode) {
        try {
            // Validate coupon with CURRENT subtotal
            appliedCoupon = await couponServices.validateCoupon(couponCode, calculatedSubtotal);

            // Calculate discount amount
            if (appliedCoupon.type === 'percentage') {
                discount = (calculatedSubtotal * appliedCoupon.value) / 100;
            } else {
                discount = appliedCoupon.value;
            }

            // Cap discount at subtotal (cannot be negative total)
            if (discount > calculatedSubtotal) {
                discount = calculatedSubtotal;
            }

            // Increment usage count for the coupon
            await Coupon.findByIdAndUpdate(appliedCoupon._id, { $inc: { usedCount: 1 } });

        } catch (error) {
            // If coupon is invalid (maybe expired just now), we can either throw error or ignore it.
            // Throwing error is safer so user knows why price changed.
            throw new Error(`Coupon processing failed: ${error.message}`);
        }
    }

    // 4. Calculate Final Total
    // Fetch tax rate from store config
    const taxConfig = storeConfig?.tax || { rate: 0, active: false };
    let tax = 0;

    // Tax is usually applied on the subtotal.
    // Some regions apply on (subtotal - discount), others on subtotal.
    // We will apply on (subtotal - discount) as it's more customer friendly.
    if (taxConfig.active) {
        const taxableAmount = Math.max(0, calculatedSubtotal - discount);
        tax = (taxableAmount * taxConfig.rate) / 100;
    }

    // Round tax to 2 decimal places
    tax = Math.round(tax * 100) / 100;

    const total = Math.max(0, calculatedSubtotal + tax + shippingCost - discount);

    // 5. Create Order
    const order = await Order.create({
        ...orderData,
        items: orderItems,
        subtotal: calculatedSubtotal,
        tax: tax,
        shippingCost: shippingCost,
        discount: discount,
        couponCode: couponCode,
        total: total,
        bankTransferDetails: orderData.bankTransferDetails // Explicitly mapped
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
        if (user) {
            // Update User Stats (Orders Count & Total Spent)
            await User.findByIdAndUpdate(user._id, {
                $inc: {
                    ordersCount: 1,
                    totalSpent: total
                }
            });

            if (user.email) {
                await sendOrderConfirmation(user.email, order);
            }

            if (user.phone) {
                await sendOrderConfirmationSMS(user.phone, order);
            }
        }
    } catch (notificationError) {
        console.error('Failed to send order notifications or update stats:', notificationError);
        // Don't fail the order creation if notifications fail
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

    // Send email & SMS notifications for status changes
    try {
        const user = await User.findById(order.customer);
        if (user) {
            // Status changed notifications
            if (updateData.status && updateData.status !== oldOrder.status) {
                // Email
                if (user.email) {
                    await sendOrderStatusUpdate(user.email, order);
                }
                // SMS
                if (user.phone) {
                    await sendOrderStatusSMS(user.phone, order);
                }
            }

            // Shipping notification
            if (updateData.tracking && updateData.status === 'Shipped') {
                if (user.email) {
                    await sendShippingNotification(user.email, order);
                }
                if (user.phone) {
                    await sendShippingSMS(user.phone, order);
                }
            }
        }
    } catch (notificationError) {
        console.error('Failed to send order update notifications:', notificationError);
        // Don't fail the update if notifications fail
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
