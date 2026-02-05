const nodemailer = require("nodemailer");
const emailTemplates = require("./emailTemplates");

const EMAIL_USER = process.env.EMAIL_USER || "naseebnoman39@gmail.com";
const MAIL_PASS = process.env.MAIL_PASS;

// Create a transporter using Gmail SMTP
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: process.env.EMAIL_PORT || 587,
  secure: false,
  auth: {
    user: EMAIL_USER,
    pass: MAIL_PASS,
  },
});

// Generic internal mail sender
const sendMailInternal = async (to, subject, html, text = "") => {
  try {
    const info = await transporter.sendMail({
      from: `"Optics Glasses Store" <${EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    });
    console.log(`[Email] Sent: ${info.messageId} to ${to}`);
    return info.messageId;
  } catch (error) {
    console.error(`[Email] Error sending to ${to}:`, error);
    throw error;
  }
};

/**
 * @desc Exported generic sendMail for custom needs
 */
const sendMail = async (to, subject, html) => {
  return await sendMailInternal(to, subject, html);
};

/**
 * @desc Send Welcome Email for new users
 */
const sendWelcomeEmail = async (userEmail, userData) => {
  const subject = "Welcome to Optics Glasses Store!";
  const html = emailTemplates.welcomeEmail(userData);
  const text = `Welcome ${userData.name}! Thank you for joining Optics Glasses Store.`;

  return await sendMailInternal(userEmail, subject, html, text);
};

/**
 * @desc Send OTP Email for verification
 */
const sendOTPEmail = async (email, otp) => {
  const subject = 'Your Verification Code - OpticsGlasses';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #333; text-align: center;">Verify Your Account</h2>
      <p>Thank you for signing up! Please use the verification code below to complete your registration:</p>
      <div style="background: #f4f4f4; padding: 20px; text-align: center; border-radius: 5px; margin: 20px 0;">
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #6366f1;">${otp}</span>
      </div>
      <p style="color: #666; font-size: 14px; text-align: center;">This code will expire in <strong>15 minutes</strong>.</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
      <p style="font-size: 12px; color: #999; text-align: center;">If you didn't request this code, please ignore this email.</p>
    </div>
  `;
  const text = `Your OpticsGlasses verification code is: ${otp}`;

  return await sendMailInternal(email, subject, html, text);
};

/**
 * @desc Send Password Reset Email
 */
const sendPasswordResetEmail = async (email, data) => {
  const subject = "Reset Your Password - OpticsGlasses";
  const html = emailTemplates.passwordReset(data);
  const text = `Please use the following link to reset your password: ${data.resetLink}`;

  return await sendMailInternal(email, subject, html, text);
};

/**
 * @desc Send Order Confirmation Email
 */
const sendOrderConfirmation = async (userEmail, orderData) => {
  const subject = `Order Confirmation - ${orderData.orderNumber}`;
  const html = emailTemplates.orderConfirmation(orderData);
  const text = `Your order ${orderData.orderNumber} has been confirmed. Total: $${orderData.total}`;

  return await sendMailInternal(userEmail, subject, html, text);
};

/**
 * @desc Send Order Status Update Email
 */
const sendOrderStatusUpdate = async (userEmail, orderData) => {
  const subject = `Order Update - ${orderData.orderNumber}`;
  const html = emailTemplates.orderStatusUpdate(orderData);
  const text = `Your order ${orderData.orderNumber} status has been updated to: ${orderData.status}`;

  return await sendMailInternal(userEmail, subject, html, text);
};

/**
 * @desc Send Shipping Notification Email
 */
const sendShippingNotification = async (userEmail, orderData) => {
  const subject = `Your Order Has Shipped - ${orderData.orderNumber}`;
  const html = emailTemplates.shippingNotification(orderData);
  const text = `Your order ${orderData.orderNumber} has been shipped.`;

  return await sendMailInternal(userEmail, subject, html, text);
};

module.exports = {
  sendMail,
  sendOTPEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendOrderConfirmation,
  sendOrderStatusUpdate,
  sendShippingNotification,
};