const axios = require("axios");

const SMS_GATEWAY_USER = process.env.SMS_GATEWAY_USER;
const SMS_GATEWAY_PASS = process.env.SMS_GATEWAY_PASS;
const SMS_GATEWAY_DEVICE_ID = process.env.SMS_GATEWAY_DEVICE_ID;

/**
 * Format phone number to international format
 * Handles Pakistani numbers: 03xx -> +923xx
 * @param {string} phoneNumber - Raw phone number
 * @returns {string} - Formatted phone number with country code
 */
const formatPhoneNumber = (phoneNumber) => {
    // Remove any spaces, dashes, or special characters
    let cleaned = phoneNumber.replace(/[\s\-\(\)]/g, '');

    // Already has + prefix, return as is
    if (cleaned.startsWith('+')) {
        return cleaned;
    }

    // Pakistani number starting with 03 -> +92 3
    if (cleaned.startsWith('03')) {
        return '+92' + cleaned.substring(1);
    }

    // Already has 92 prefix without +
    if (cleaned.startsWith('92')) {
        return '+' + cleaned;
    }

    // Default: add + prefix
    return '+' + cleaned;
};

/**
 * Send an SMS message using sms-gate.app
 * @param {string} phoneNumber - The recipient's phone number (with or without country code)
 * @param {string} message - The message text
 * @returns {Promise<Object>} - API response
 */
const sendSMS = async (phoneNumber, message) => {
    try {
        const authString = Buffer.from(`${SMS_GATEWAY_USER}:${SMS_GATEWAY_PASS}`).toString("base64");

        // Format phone number to international format
        const formattedPhoneNumber = formatPhoneNumber(phoneNumber);
        console.log(`Sending SMS to: ${formattedPhoneNumber}`);

        const response = await axios.post(
            "https://api.sms-gate.app/3rdparty/v1/messages",
            {
                textMessage: { text: message },
                phoneNumbers: [formattedPhoneNumber],
                deviceId: SMS_GATEWAY_DEVICE_ID,
            },
            {
                headers: {
                    Authorization: `Basic ${authString}`,
                    "Content-Type": "application/json",
                },
            }
        );

        console.log(`SMS sent successfully to: ${formattedPhoneNumber}`);
        return response.data;
    } catch (error) {
        console.error("SMS Sending Error:", error.response?.data || error.message);
        // Don't throw - we want emails to still work even if SMS fails
        return null;
    }
};

/**
 * Send order confirmation SMS
 * @param {string} phoneNumber 
 * @param {Object} orderData 
 */
const sendOrderConfirmationSMS = async (phoneNumber, orderData) => {
    const message = `Order Confirmed! Your order ${orderData.orderNumber} for $${orderData.totalAmount} has been received. Thank you for shopping with Optics Glasses!`;
    return await sendSMS(phoneNumber, message);
};

/**
 * Send order status update SMS
 * @param {string} phoneNumber 
 * @param {Object} orderData 
 */
const sendOrderStatusSMS = async (phoneNumber, orderData) => {
    const message = `Order Update: Your order ${orderData.orderNumber} status is now: ${orderData.status}. Check your dashboard for more details.`;
    return await sendSMS(phoneNumber, message);
};

const sendOTPSMS = async (phoneNumber, otp) => {
    const message = `Your Optics Glasses verification code is: ${otp}. It expires in 15 minutes.`;
    return await sendSMS(phoneNumber, message);
};

const sendShippingSMS = async (phoneNumber, orderData) => {
    const message = `Great news! Your order #${orderData.orderNumber} has been shipped. Tracking: ${orderData.tracking}. View details in your account.`;
    return await sendSMS(phoneNumber, message);
};

module.exports = {
    sendSMS,
    sendOrderConfirmationSMS,
    sendOrderStatusSMS,
    sendOTPSMS,
    sendShippingSMS,
};
