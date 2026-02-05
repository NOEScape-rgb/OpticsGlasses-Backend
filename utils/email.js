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
const nodemailer = require('nodemailer');
const nodemailer = require('nodemailer');

// Create reusable transporter object using SMTP transport
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Send OTP Email
const sendOTPEmail = async (email, otp) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"OpticsGlasses" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your Verification Code - OpticsGlasses',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background-color: #f4f4f4;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 40px auto;
              background-color: #ffffff;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              padding: 40px 30px;
              text-align: center;
              color: white;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
              font-weight: 600;
            }
            .content {
              padding: 40px 30px;
              text-align: center;
            }
            .content p {
              color: #555;
              font-size: 16px;
              line-height: 1.6;
              margin-bottom: 30px;
            }
            .otp-box {
              display: inline-block;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              font-size: 36px;
              font-weight: bold;
              letter-spacing: 8px;
              padding: 20px 40px;
              border-radius: 10px;
              margin: 20px 0;
              box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
            }
            .note {
              color: #888;
              font-size: 14px;
              margin-top: 30px;
            }
            .footer {
              background-color: #f8f9fa;
              padding: 20px;
              text-align: center;
              color: #888;
              font-size: 12px;
            }
            .warning {
              background-color: #fff3cd;
              border-left: 4px solid #ffc107;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
              text-align: left;
            }
            .warning p {
              margin: 0;
              color: #856404;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>👓 OpticsGlasses</h1>
            </div>
            <div class="content">
              <h2 style="color: #333; margin-bottom: 10px;">Verify Your Account</h2>
              <p>Thank you for signing up! Please use the verification code below to complete your registration:</p>
              <div class="otp-box">${otp}</div>
              <p class="note">This code will expire in <strong>15 minutes</strong></p>
              <div class="warning">
                <p><strong>⚠️ Security Notice:</strong> Never share this code with anyone. OpticsGlasses will never ask for your verification code via phone or email.</p>
              </div>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} OpticsGlasses. All rights reserved.</p>
              <p>If you didn't request this code, please ignore this email.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('OTP Email sent: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw new Error('Failed to send verification email');
  }
};

// Send Welcome Email
const sendWelcomeEmail = async (email, userData) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"OpticsGlasses" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Welcome to OpticsGlasses! 🎉',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background-color: #f4f4f4;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 40px auto;
              background-color: #ffffff;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              padding: 40px 30px;
              text-align: center;
              color: white;
            }
            .content {
              padding: 40px 30px;
            }
            .content h2 {
              color: #333;
              margin-bottom: 20px;
            }
            .content p {
              color: #555;
              font-size: 16px;
              line-height: 1.6;
              margin-bottom: 15px;
            }
            .button {
              display: inline-block;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              text-decoration: none;
              padding: 15px 40px;
              border-radius: 8px;
              margin: 20px 0;
              font-weight: 600;
              transition: transform 0.2s;
            }
            .button:hover {
              transform: scale(1.05);
            }
            .features {
              background-color: #f8f9fa;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
            }
            .features ul {
              list-style: none;
              padding: 0;
              margin: 0;
            }
            .features li {
              padding: 10px 0;
              color: #555;
            }
            .features li:before {
              content: "✓ ";
              color: #667eea;
              font-weight: bold;
              margin-right: 10px;
            }
            .footer {
              background-color: #f8f9fa;
              padding: 20px;
              text-align: center;
              color: #888;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>👓 Welcome to OpticsGlasses!</h1>
            </div>
            <div class="content">
              <h2>Hello ${userData.name || 'there'}! 👋</h2>
              <p>We're thrilled to have you join the OpticsGlasses family! Your account has been successfully verified and you're all set to explore our collection.</p>

              <div class="features">
                <h3 style="color: #333; margin-top: 0;">What you can do now:</h3>
                <ul>
                  <li>Browse our premium eyewear collection</li>
                  <li>Save your favorite products to your wishlist</li>
                  <li>Get exclusive deals and offers</li>
                  <li>Track your orders in real-time</li>
                  <li>Manage your profile and preferences</li>
                </ul>
              </div>

              <div style="text-align: center;">
                <a href="${process.env.FRONT_END_URL || 'http://localhost:5173'}" class="button">Start Shopping</a>
              </div>

              <p style="margin-top: 30px;">If you have any questions or need assistance, our support team is always here to help!</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} OpticsGlasses. All rights reserved.</p>
              <p>You're receiving this email because you created an account on OpticsGlasses.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Welcome Email sent: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    throw new Error('Failed to send welcome email');
  }
};

// Send Password Reset Email
const sendPasswordResetEmail = async (email, data) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"OpticsGlasses" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Reset Your Password - OpticsGlasses',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background-color: #f4f4f4;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 40px auto;
              background-color: #ffffff;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              padding: 40px 30px;
              text-align: center;
              color: white;
            }
            .content {
              padding: 40px 30px;
            }
            .content h2 {
              color: #333;
              margin-bottom: 20px;
            }
            .content p {
              color: #555;
              font-size: 16px;
              line-height: 1.6;
              margin-bottom: 15px;
            }
            .button {
              display: inline-block;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              text-decoration: none;
              padding: 15px 40px;
              border-radius: 8px;
              margin: 20px 0;
              font-weight: 600;
            }
            .warning {
              background-color: #fff3cd;
              border-left: 4px solid #ffc107;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
            }
            .warning p {
              margin: 0;
              color: #856404;
              font-size: 14px;
            }
            .footer {
              background-color: #f8f9fa;
              padding: 20px;
              text-align: center;
              color: #888;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Password Reset</h1>
            </div>
            <div class="content">
              <h2>Reset Your Password</h2>
              <p>We received a request to reset your password. Click the button below to create a new password:</p>

              <div style="text-align: center;">
                <a href="${data.resetLink}" class="button">Reset Password</a>
              </div>

              <p style="margin-top: 30px; color: #888; font-size: 14px;">Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #667eea; font-size: 12px;">${data.resetLink}</p>

              <div class="warning">
                <p><strong>⚠️ Security Notice:</strong></p>
                <p>• This link will expire in 15 minutes</p>
                <p>• If you didn't request this reset, please ignore this email</p>
                <p>• Never share this link with anyone</p>
              </div>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} OpticsGlasses. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Password Reset Email sent: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
};

// Generic send email function
const sendMail = async (to, subject, html) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"OpticsGlasses" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }
};

module.exports = {
  sendMail,
  sendOTPEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
};
// Create reusable transporter
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Generic email sender
const sendMail = async (to, subject, html) => {
  try {
    const mailOptions = {
      from: `"${process.env.APP_NAME || 'OpticsGlasses'}" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

// Send OTP Email
const sendOTPEmail = async (email, otp) => {
  const subject = 'Your Verification Code';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verification Code</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #f4f4f4;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 40px auto;
          background-color: #ffffff;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: #ffffff;
          padding: 40px 20px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 600;
        }
        .content {
          padding: 40px 30px;
        }
        .otp-box {
          background-color: #f8f9fa;
          border: 2px dashed #667eea;
          border-radius: 8px;
          padding: 30px;
          text-align: center;
          margin: 30px 0;
        }
        .otp-code {
          font-size: 36px;
          font-weight: bold;
          color: #667eea;
          letter-spacing: 8px;
          margin: 10px 0;
        }
        .message {
          font-size: 16px;
          color: #555;
          margin-bottom: 20px;
        }
        .warning {
          background-color: #fff3cd;
          border-left: 4px solid #ffc107;
          padding: 15px;
          margin: 20px 0;
          border-radius: 4px;
        }
        .warning p {
          margin: 0;
          color: #856404;
          font-size: 14px;
        }
        .footer {
          background-color: #f8f9fa;
          padding: 20px;
          text-align: center;
          font-size: 14px;
          color: #6c757d;
        }
        .footer a {
          color: #667eea;
          text-decoration: none;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${process.env.APP_NAME || 'OpticsGlasses'}</h1>
        </div>
        <div class="content">
          <p class="message">Hello,</p>
          <p class="message">Thank you for signing up! Please use the verification code below to complete your registration:</p>

          <div class="otp-box">
            <p style="margin: 0; color: #666; font-size: 14px;">Your Verification Code</p>
            <div class="otp-code">${otp}</div>
            <p style="margin: 10px 0 0 0; color: #999; font-size: 13px;">Valid for 15 minutes</p>
          </div>

          <p class="message">Enter this code on the verification page to activate your account.</p>

          <div class="warning">
            <p><strong>Security Note:</strong> Never share this code with anyone. Our team will never ask for your verification code.</p>
          </div>
        </div>
        <div class="footer">
          <p>If you didn't request this code, please ignore this email.</p>
          <p>&copy; ${new Date().getFullYear()} ${process.env.APP_NAME || 'OpticsGlasses'}. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendMail(email, subject, html);
};

// Send Welcome Email
const sendWelcomeEmail = async (email, userData) => {
  const subject = `Welcome to ${process.env.APP_NAME || 'OpticsGlasses'}!`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #f4f4f4;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 40px auto;
          background-color: #ffffff;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: #ffffff;
          padding: 40px 20px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 32px;
          font-weight: 600;
        }
        .content {
          padding: 40px 30px;
        }
        .welcome-message {
          font-size: 18px;
          color: #333;
          margin-bottom: 20px;
        }
        .cta-button {
          display: inline-block;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: #ffffff;
          padding: 15px 40px;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 600;
          margin: 20px 0;
        }
        .features {
          margin: 30px 0;
        }
        .feature {
          margin: 15px 0;
          padding-left: 25px;
          position: relative;
        }
        .feature:before {
          content: "✓";
          position: absolute;
          left: 0;
          color: #667eea;
          font-weight: bold;
        }
        .footer {
          background-color: #f8f9fa;
          padding: 20px;
          text-align: center;
          font-size: 14px;
          color: #6c757d;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to ${process.env.APP_NAME || 'OpticsGlasses'}!</h1>
        </div>
        <div class="content">
          <p class="welcome-message">Hi ${userData.name},</p>
          <p class="welcome-message">Thank you for joining us! Your account has been successfully verified.</p>

          <div style="text-align: center;">
            <a href="${process.env.FRONT_END_URL}" class="cta-button">Start Shopping</a>
          </div>

          <div class="features">
            <p style="font-weight: 600; margin-bottom: 15px;">What you can do now:</p>
            <div class="feature">Browse our exclusive collection of eyewear</div>
            <div class="feature">Get personalized recommendations</div>
            <div class="feature">Track your orders in real-time</div>
            <div class="feature">Enjoy exclusive member discounts</div>
          </div>

          <p style="margin-top: 30px;">If you have any questions, feel free to reach out to our support team.</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} ${process.env.APP_NAME || 'OpticsGlasses'}. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendMail(email, subject, html);
};

// Send Password Reset Email
const sendPasswordResetEmail = async (email, data) => {
  const subject = 'Reset Your Password';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Password</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #f4f4f4;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 40px auto;
          background-color: #ffffff;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: #ffffff;
          padding: 40px 20px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 600;
        }
        .content {
          padding: 40px 30px;
        }
        .message {
          font-size: 16px;
          color: #555;
          margin-bottom: 20px;
        }
        .cta-button {
          display: inline-block;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: #ffffff;
          padding: 15px 40px;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 600;
          margin: 20px 0;
        }
        .warning {
          background-color: #fff3cd;
          border-left: 4px solid #ffc107;
          padding: 15px;
          margin: 20px 0;
          border-radius: 4px;
        }
        .warning p {
          margin: 0;
          color: #856404;
          font-size: 14px;
        }
        .footer {
          background-color: #f8f9fa;
          padding: 20px;
          text-align: center;
          font-size: 14px;
          color: #6c757d;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Password Reset Request</h1>
        </div>
        <div class="content">
          <p class="message">Hello,</p>
          <p class="message">We received a request to reset your password. Click the button below to create a new password:</p>

          <div style="text-align: center;">
            <a href="${data.resetLink}" class="cta-button">Reset Password</a>
          </div>

          <p class="message">This link will expire in 15 minutes for security reasons.</p>

          <div class="warning">
            <p><strong>Security Note:</strong> If you didn't request a password reset, please ignore this email. Your password will remain unchanged.</p>
          </div>
        </div>
        <div class="footer">
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #667eea;">${data.resetLink}</p>
          <p>&copy; ${new Date().getFullYear()} ${process.env.APP_NAME || 'OpticsGlasses'}. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendMail(email, subject, html);
};

module.exports = {
  sendMail,
  sendOTPEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
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