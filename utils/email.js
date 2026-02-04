const nodemailer = require("nodemailer");
const emailTemplates = require("./emailTemplates");

const MAIL_PASS = process.env.MAIL_PASS;

// Create a transporter using Gmail SMTP
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: "naseebnoman39@gmail.com",
    pass: MAIL_PASS,
  },
});

// Send an email using async/await
const sendMail = async (senderMail, subject, text, html) => {
  const info = await transporter.sendMail({
    from: '"Optics Glasses Store" <naseebnoman39@gmail.com>',
    to: senderMail,
    subject: subject,
    text: text,
    html: html,
  });

  return info.messageId;
};

// Send order confirmation email
const sendOrderConfirmation = async (userEmail, orderData) => {
  const subject = `Order Confirmation - ${orderData.orderNumber}`;
  const html = emailTemplates.orderConfirmation(orderData);
  const text = `Your order ${orderData.orderNumber} has been confirmed. Total: $${orderData.total}`;

  return await sendMail(userEmail, subject, text, html);
};

// Send order status update email
const sendOrderStatusUpdate = async (userEmail, orderData) => {
  const subject = `Order Update - ${orderData.orderNumber}`;
  const html = emailTemplates.orderStatusUpdate(orderData);
  const text = `Your order ${orderData.orderNumber} status has been updated to: ${orderData.status}`;

  return await sendMail(userEmail, subject, text, html);
};

// Send shipping notification email
const sendShippingNotification = async (userEmail, orderData) => {
  const subject = `Your Order Has Shipped - ${orderData.orderNumber}`;
  const html = emailTemplates.shippingNotification(orderData);
  const text = `Your order ${orderData.orderNumber} has been shipped. Tracking: ${orderData.tracking?.number}`;

  return await sendMail(userEmail, subject, text, html);
};

// Send welcome email for new users
const sendWelcomeEmail = async (userEmail, userData) => {
  const subject = "Welcome to Optics Glasses Store!";
  const html = emailTemplates.welcomeEmail(userData);
  const text = `Welcome ${userData.name}! Thank you for joining Optics Glasses Store.`;

  return await sendMail(userEmail, subject, text, html);
};

// Send password reset email
const sendPasswordResetEmail = async (userEmail, resetData) => {
  const subject = "Password Reset Request";
  const html = emailTemplates.passwordReset(resetData);
  const text = `Click the link to reset your password: ${resetData.resetLink}`;

  return await sendMail(userEmail, subject, text, html);
};

module.exports = {
  sendMail,
  sendOrderConfirmation,
  sendOrderStatusUpdate,
  sendShippingNotification,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendOTPEmail: async (userEmail, otp) => {
    const subject = "Verification Code - Optics Glasses";
    const text = `Your verification code is: ${otp}. It will expire in 15 minutes.`;
    const html = `<div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #333;">Verification Code</h2>
      <p>Thank you for signing up with Optics Glasses Store. Use the code below to verify your account:</p>
      <div style="background: #f4f4f4; padding: 15px; font-size: 24px; font-weight: bold; text-align: center; letter-spacing: 5px; margin: 20px 0;">${otp}</div>
      <p>This code will <b>expire in 15 minutes</b>.</p>
      <p>If you didn't request this code, please ignore this email.</p>
    </div>`;
    return await sendMail(userEmail, subject, text, html);
  }
};