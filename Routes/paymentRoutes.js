const express = require('express');
const router = express.Router();
const {
    createPaymentIntentController,
    confirmPaymentController,
    processRefundController,
    stripeWebhookController,
} = require('../controllers/paymentController');
const { verifyToken, verifyAdminToken } = require('../middleware/authMiddleware');

/**
 * @route   POST /api/payments/create-intent
 * @desc    Create payment intent for order
 * @access  Private
 */
router.post('/create-intent', verifyToken, createPaymentIntentController);

/**
 * @route   POST /api/payments/confirm
 * @desc    Confirm payment intent
 * @access  Private
 */
router.post('/confirm', verifyToken, confirmPaymentController);

/**
 * @route   POST /api/payments/refund
 * @desc    Process refund for order
 * @access  Private (Admin)
 */
router.post('/refund', verifyAdminToken, processRefundController);

/**
 * @route   POST /api/payments/webhook
 * @desc    Stripe webhook endpoint
 * @access  Public (Stripe)
 */
router.post('/webhook', express.raw({ type: 'application/json' }), stripeWebhookController);

module.exports = router;