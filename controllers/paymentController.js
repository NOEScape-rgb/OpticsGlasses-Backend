const paymentServices = require('../services/paymentServices');
const Order = require('../models/Order');

// Create Payment Intent
const createPaymentIntentController = async (req, res) => {
    try {
        const { orderId, amount, currency = 'usd' } = req.body;

        if (!orderId || !amount) {
            return res.status(400).json({
                isStatus: false,
                msg: 'Order ID and amount are required',
                data: null,
            });
        }

        // Verify order exists and belongs to user
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({
                isStatus: false,
                msg: 'Order not found',
                data: null,
            });
        }

        // Check if user owns the order (unless admin)
        if (req.user.role !== 'admin' && order.customer.toString() !== req.user.id) {
            return res.status(403).json({
                isStatus: false,
                msg: 'Unauthorized to process payment for this order',
                data: null,
            });
        }

        const paymentIntent = await paymentServices.createPaymentIntent(
            amount,
            currency,
            {
                orderId: orderId,
                customerId: req.user.id,
                customerEmail: req.user.email,
            }
        );

        // Update order with payment intent ID
        await Order.findByIdAndUpdate(orderId, {
            paymentIntentId: paymentIntent.paymentIntentId,
        });

        res.status(200).json({
            isStatus: true,
            msg: 'Payment intent created successfully',
            data: paymentIntent,
        });
    } catch (error) {
        res.status(500).json({
            isStatus: false,
            msg: error.message || 'Internal Server Error',
            data: null,
        });
    }
};

// Confirm Payment
const confirmPaymentController = async (req, res) => {
    try {
        const { paymentIntentId } = req.body;

        if (!paymentIntentId) {
            return res.status(400).json({
                isStatus: false,
                msg: 'Payment Intent ID is required',
                data: null,
            });
        }

        const paymentIntent = await paymentServices.confirmPaymentIntent(paymentIntentId);

        // Update order payment status
        if (paymentIntent.status === 'succeeded') {
            await Order.findOneAndUpdate(
                { paymentIntentId: paymentIntentId },
                { 
                    paymentStatus: 'Paid',
                    status: 'Processing',
                }
            );
        }

        res.status(200).json({
            isStatus: true,
            msg: 'Payment confirmed successfully',
            data: paymentIntent,
        });
    } catch (error) {
        res.status(500).json({
            isStatus: false,
            msg: error.message || 'Internal Server Error',
            data: null,
        });
    }
};

// Process Refund
const processRefundController = async (req, res) => {
    try {
        const { orderId, amount } = req.body;

        if (!orderId) {
            return res.status(400).json({
                isStatus: false,
                msg: 'Order ID is required',
                data: null,
            });
        }

        const order = await Order.findById(orderId);
        if (!order || !order.paymentIntentId) {
            return res.status(404).json({
                isStatus: false,
                msg: 'Order or payment not found',
                data: null,
            });
        }

        const refund = await paymentServices.createRefund(order.paymentIntentId, amount);

        // Update order status
        await Order.findByIdAndUpdate(orderId, {
            paymentStatus: amount && amount < order.total ? 'Partially Refunded' : 'Refunded',
            refundId: refund.id,
        });

        res.status(200).json({
            isStatus: true,
            msg: 'Refund processed successfully',
            data: refund,
        });
    } catch (error) {
        res.status(500).json({
            isStatus: false,
            msg: error.message || 'Internal Server Error',
            data: null,
        });
    }
};

// Stripe Webhook Handler
const stripeWebhookController = async (req, res) => {
    try {
        const sig = req.headers['stripe-signature'];
        const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

        let event;
        try {
            event = require('stripe').webhooks.constructEvent(req.body, sig, endpointSecret);
        } catch (err) {
            return res.status(400).json({
                isStatus: false,
                msg: `Webhook signature verification failed: ${err.message}`,
                data: null,
            });
        }

        const result = await paymentServices.handleWebhook(event);

        // Handle specific webhook events
        if (result.type === 'payment_succeeded') {
            // Update order status, send confirmation email, etc.
            const paymentIntent = result.data;
            if (paymentIntent.metadata.orderId) {
                await Order.findByIdAndUpdate(paymentIntent.metadata.orderId, {
                    paymentStatus: 'Paid',
                    status: 'Processing',
                });
            }
        }

        res.status(200).json({
            isStatus: true,
            msg: 'Webhook processed successfully',
            data: result,
        });
    } catch (error) {
        res.status(500).json({
            isStatus: false,
            msg: error.message || 'Internal Server Error',
            data: null,
        });
    }
};

module.exports = {
    createPaymentIntentController,
    confirmPaymentController,
    processRefundController,
    stripeWebhookController,
};