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
  if (!phoneNumber) return '';

  // Remove any spaces, dashes, or special characters
  let cleaned = phoneNumber.toString().replace(/[\s\-\(\)]/g, '');

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

  // Default: add + prefix if it's long enough to be a number with CC
  if (cleaned.length >= 10) {
    // Logic for Pakistan (users often enter 3001234567 without 0)
    if (cleaned.length === 10 && cleaned.startsWith('3')) {
      return '+92' + cleaned;
    }
    return '+' + cleaned;
  }

  return cleaned;
};

/**
 * Send an SMS message using sms-gate.app
 * @param {string} phoneNumber - The recipient's phone number (with or without country code)
 * @param {string} message - The message text
 * @returns {Promise<Object>} - API response
 */
const sendSMS = async (phoneNumber, message) => {
  try {
    if (!SMS_GATEWAY_USER || !SMS_GATEWAY_PASS || !SMS_GATEWAY_DEVICE_ID) {
      console.warn("⚠️ SMS Gateway credentials are not fully configured in .env");
      return { success: false, message: 'SMS credentials missing' };
    }

    const authString = Buffer.from(`${SMS_GATEWAY_USER}:${SMS_GATEWAY_PASS}`).toString("base64");

    // Format phone number to international format
    const formattedPhoneNumber = formatPhoneNumber(phoneNumber);
    console.log(`[SMS] Attempting to send SMS to: ${formattedPhoneNumber}`);

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
        timeout: 10000 // 10 second timeout
      }
    );

    console.log(`✅ [SMS] Sent successfully to: ${formattedPhoneNumber}`);
    return { success: true, data: response.data };
  } catch (error) {
    const errorDetail = error.response?.data || error.message;
    console.error("❌ [SMS] Sending Error Full Details:", JSON.stringify(errorDetail, null, 2));
    if (error.response) {
      console.error("❌ [SMS] Status Code:", error.response.status);
      console.error("❌ [SMS] Headers:", JSON.stringify(error.response.headers, null, 2));
    }
    return { success: false, error: errorDetail };
  }
};

/**
 * Send OTP SMS
 * @param {string} phoneNumber 
 * @param {string} otp 
 */
const sendOTPSMS = async (phoneNumber, otp) => {
  const appName = process.env.APP_NAME || 'Optics Glasses';
  const message = `Your ${appName} verification code is: ${otp}. It expires in 15 minutes.`;
  return await sendSMS(phoneNumber, message);
};

/**
 * Send welcome SMS
 * @param {string} phoneNumber 
 * @param {Object} userData 
 */
const sendWelcomeSMS = async (phoneNumber, userData) => {
  const appName = process.env.APP_NAME || 'Optics Glasses';
  const message = `Welcome to ${appName}, ${userData.name || 'valued customer'}! 👓 Your account has been verified. Start shopping now!`;
  return await sendSMS(phoneNumber, message);
};

/**
 * Send order confirmation SMS
 * @param {string} phoneNumber 
 * @param {Object} orderData 
 */
const sendOrderConfirmationSMS = async (phoneNumber, orderData) => {
  const message = `Order Confirmed! Your order ${orderData.orderNumber} for RS: ${orderData.total}. Thank you for shopping with Optics Glasses!`;
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

/**
 * Send shipping update SMS
 * @param {string} phoneNumber 
 * @param {Object} orderData 
 */
const sendShippingSMS = async (phoneNumber, orderData) => {
  const trackingInfo = orderData.tracking?.number ? `${orderData.tracking.carrier || ''} ${orderData.tracking.number}` : (orderData.tracking || 'Pending');
  const message = `Great news! Your order ${orderData.orderNumber} has been shipped. Tracking: ${trackingInfo}. View details in your account.`;
  return await sendSMS(phoneNumber, message);
};

module.exports = {
  sendSMS,
  sendOTPSMS,
  sendWelcomeSMS,
  sendOrderConfirmationSMS,
  sendOrderStatusSMS,
  sendShippingSMS,
};
