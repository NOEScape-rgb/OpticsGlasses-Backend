const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Create Payment Intent for Stripe
const createPaymentIntent = async (amount, currency = 'usd', metadata = {}) => {
    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Convert to cents
            currency: currency.toLowerCase(),
            metadata,
            automatic_payment_methods: {
                enabled: true,
            },
        });

        return {
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id,
        };
    } catch (error) {
        throw new Error(`Payment intent creation failed: ${error.message}`);
    }
};

// Confirm Payment Intent
const confirmPaymentIntent = async (paymentIntentId) => {
    try {
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        return paymentIntent;
    } catch (error) {
        throw new Error(`Payment confirmation failed: ${error.message}`);
    }
};

// Create Refund
const createRefund = async (paymentIntentId, amount = null) => {
    try {
        const refundData = { payment_intent: paymentIntentId };
        if (amount) {
            refundData.amount = Math.round(amount * 100); // Convert to cents
        }

        const refund = await stripe.refunds.create(refundData);
        return refund;
    } catch (error) {
        throw new Error(`Refund creation failed: ${error.message}`);
    }
};

// Webhook handler for Stripe events
const handleWebhook = async (event) => {
    switch (event.type) {
        case 'payment_intent.succeeded':
            // Handle successful payment
            const paymentIntent = event.data.object;
            return { type: 'payment_succeeded', data: paymentIntent };
        
        case 'payment_intent.payment_failed':
            // Handle failed payment
            const failedPayment = event.data.object;
            return { type: 'payment_failed', data: failedPayment };
        
        default:
            return { type: 'unhandled', data: event.data.object };
    }
};

module.exports = {
    createPaymentIntent,
    confirmPaymentIntent,
    createRefund,
    handleWebhook,
};