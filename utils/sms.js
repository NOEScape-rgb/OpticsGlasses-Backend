const axios = require("axios");

const SMS_GATEWAY_USER = process.env.SMS_GATEWAY_USER;
const SMS_GATEWAY_PASS = process.env.SMS_GATEWAY_PASS;
const SMS_GATEWAY_DEVICE_ID = process.env.SMS_GATEWAY_DEVICE_ID;

/**
 * Send an SMS message using sms-gate.app
 * @param {string} phoneNumber - The recipient's phone number (with country code, e.g., +923149914203)
 * @param {string} message - The message text
 * @returns {Promise<Object>} - API response
 */
const sendSMS = async (phoneNumber, message) => {
    try {
        const authString = Buffer.from(`${SMS_GATEWAY_USER}:${SMS_GATEWAY_PASS}`).toString("base64");

        // Ensure phone number starts with +
        const formattedPhoneNumber = phoneNumber.startsWith("+") ? phoneNumber : `+${phoneNumber}`;

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

        return response.data;
    } catch (error) {
        console.error("SMS Sending Error:", error.response?.data || error.message);
        throw new Error("Failed to send SMS notification");
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

module.exports = {
    sendSMS,
    sendOrderConfirmationSMS,
    sendOrderStatusSMS,
    sendOTPSMS,
};
