const forgotPasswordTemplate = (resetLink) => {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #101415;
      font-family: 'Arial', sans-serif;
      color: #FEFDED;
    }
    .container {
      width: 100%;
      max-width: 600px;
      margin: 0 auto;
      padding: 40px 20px;
      background-color: #101415;
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
    }
    .logo {
      font-size: 28px;
      font-weight: bold;
      color: #FEFDED;
      text-decoration: none;
      letter-spacing: 1px;
      text-transform: uppercase;
    }
    .content {
      background-color: #15191a;
      padding: 40px;
      border-radius: 12px;
      border: 1px solid #2a2a2a;
      text-align: center;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    }
    h1 {
      font-size: 26px;
      margin-bottom: 24px;
      color: #FEFDED;
      font-weight: 600;
    }
    p {
      font-size: 16px;
      line-height: 1.6;
      color: #d1d1d1;
      margin-bottom: 32px;
    }
    .btn {
      display: inline-block;
      padding: 16px 32px;
      background-color: #FEFDED;
      color: #101415;
      text-decoration: none;
      font-weight: bold;
      border-radius: 8px;
      font-size: 16px;
      transition: opacity 0.3s ease;
    }
    .btn:hover {
      opacity: 0.9;
    }
    .footer {
      text-align: center;
      margin-top: 40px;
      font-size: 12px;
      color: #666;
    }
    .link-text {
        word-break: break-all;
        color: #4a90e2;
        font-size: 12px;
        margin-top: 10px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">OpticGlasses</div>
    </div>
    <div class="content">
      <h1>Reset Your Password</h1>
      <p>We received a request to reset the password for your OpticGlasses account. Click the button below to proceed.</p>
      
      <a href="${resetLink}" class="btn">Reset Password</a>

      <p style="margin-top: 30px; font-size: 14px; color: #888;">
        Or copy and paste this link into your browser:<br>
        <a href="${resetLink}" class="link-text" style="color: #888; text-decoration: underline;">${resetLink}</a>
      </p>

      <p style="margin-top: 20px; font-size: 14px; color: #666;">
        If you didn't request this change, please ignore this email. Your password will remain unchanged.
      </p>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} OpticGlasses. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
};

// Order confirmation email template
const orderConfirmation = (orderData) => {
    const itemsHtml = orderData.items.map(item => `
        <tr>
            <td style="padding: 15px; border-bottom: 1px solid #2a2a2a;">
                <div style="display: flex; align-items: center;">
                    <img src="${item.image || '/default-product.jpg'}" alt="${item.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px; margin-right: 15px;">
                    <div>
                        <h4 style="margin: 0; color: #FEFDED; font-size: 16px;">${item.name}</h4>
                        <p style="margin: 5px 0; color: #d1d1d1; font-size: 14px;">Qty: ${item.quantity}</p>
                    </div>
                </div>
            </td>
            <td style="padding: 15px; border-bottom: 1px solid #2a2a2a; text-align: right; color: #FEFDED; font-weight: bold;">
                $${(item.price * item.quantity).toFixed(2)}
            </td>
        </tr>
    `).join('');

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Confirmation</title>
    <style>
        body { margin: 0; padding: 0; background-color: #101415; font-family: 'Arial', sans-serif; color: #FEFDED; }
        .container { width: 100%; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #101415; }
        .header { text-align: center; margin-bottom: 40px; }
        .logo { font-size: 28px; font-weight: bold; color: #FEFDED; letter-spacing: 1px; text-transform: uppercase; }
        .content { background-color: #15191a; padding: 40px; border-radius: 12px; border: 1px solid #2a2a2a; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3); }
        h1 { font-size: 26px; margin-bottom: 24px; color: #FEFDED; font-weight: 600; text-align: center; }
        .order-info { background-color: #1a1f20; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
        .order-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .total-row { background-color: #1a1f20; font-weight: bold; }
        .footer { text-align: center; margin-top: 40px; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">OpticGlasses</div>
        </div>
        <div class="content">
            <h1>Order Confirmed!</h1>
            <div class="order-info">
                <p><strong>Order Number:</strong> ${orderData.orderNumber}</p>
                <p><strong>Order Date:</strong> ${new Date(orderData.createdAt).toLocaleDateString()}</p>
                <p><strong>Status:</strong> ${orderData.status}</p>
            </div>
            
            <table class="order-table">
                <thead>
                    <tr style="background-color: #1a1f20;">
                        <th style="padding: 15px; text-align: left; color: #FEFDED;">Items</th>
                        <th style="padding: 15px; text-align: right; color: #FEFDED;">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHtml}
                    <tr class="total-row">
                        <td style="padding: 15px; color: #FEFDED;">Subtotal</td>
                        <td style="padding: 15px; text-align: right; color: #FEFDED;">$${orderData.subtotal.toFixed(2)}</td>
                    </tr>
                    <tr class="total-row">
                        <td style="padding: 15px; color: #FEFDED;">Shipping</td>
                        <td style="padding: 15px; text-align: right; color: #FEFDED;">$${orderData.shippingCost.toFixed(2)}</td>
                    </tr>
                    <tr class="total-row">
                        <td style="padding: 15px; color: #FEFDED; font-size: 18px;"><strong>Total</strong></td>
                        <td style="padding: 15px; text-align: right; color: #FEFDED; font-size: 18px;"><strong>$${orderData.total.toFixed(2)}</strong></td>
                    </tr>
                </tbody>
            </table>
            
            <p style="text-align: center; color: #d1d1d1;">Thank you for your order! We'll send you updates as your order progresses.</p>
        </div>
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} OpticGlasses. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`;
};

// Order status update email template
const orderStatusUpdate = (orderData) => {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Status Update</title>
    <style>
        body { margin: 0; padding: 0; background-color: #101415; font-family: 'Arial', sans-serif; color: #FEFDED; }
        .container { width: 100%; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #101415; }
        .header { text-align: center; margin-bottom: 40px; }
        .logo { font-size: 28px; font-weight: bold; color: #FEFDED; letter-spacing: 1px; text-transform: uppercase; }
        .content { background-color: #15191a; padding: 40px; border-radius: 12px; border: 1px solid #2a2a2a; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3); text-align: center; }
        h1 { font-size: 26px; margin-bottom: 24px; color: #FEFDED; font-weight: 600; }
        .status-badge { display: inline-block; padding: 10px 20px; background-color: #FEFDED; color: #101415; border-radius: 20px; font-weight: bold; margin: 20px 0; }
        .footer { text-align: center; margin-top: 40px; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">OpticGlasses</div>
        </div>
        <div class="content">
            <h1>Order Status Update</h1>
            <p>Your order <strong>${orderData.orderNumber}</strong> status has been updated:</p>
            <div class="status-badge">${orderData.status}</div>
            <p style="color: #d1d1d1;">We'll continue to keep you updated on your order progress.</p>
        </div>
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} OpticGlasses. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`;
};

// Shipping notification email template
const shippingNotification = (orderData) => {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Order Has Shipped</title>
    <style>
        body { margin: 0; padding: 0; background-color: #101415; font-family: 'Arial', sans-serif; color: #FEFDED; }
        .container { width: 100%; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #101415; }
        .header { text-align: center; margin-bottom: 40px; }
        .logo { font-size: 28px; font-weight: bold; color: #FEFDED; letter-spacing: 1px; text-transform: uppercase; }
        .content { background-color: #15191a; padding: 40px; border-radius: 12px; border: 1px solid #2a2a2a; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3); text-align: center; }
        h1 { font-size: 26px; margin-bottom: 24px; color: #FEFDED; font-weight: 600; }
        .tracking-info { background-color: #1a1f20; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 40px; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">OpticGlasses</div>
        </div>
        <div class="content">
            <h1>Your Order Has Shipped! 📦</h1>
            <p>Great news! Your order <strong>${orderData.orderNumber}</strong> is on its way.</p>
            ${orderData.tracking?.number ? `
            <div class="tracking-info">
                <p><strong>Tracking Number:</strong> ${orderData.tracking.number}</p>
                <p><strong>Carrier:</strong> ${orderData.tracking.carrier || 'Standard Shipping'}</p>
            </div>
            ` : ''}
            <p style="color: #d1d1d1;">You should receive your order within 3-7 business days.</p>
        </div>
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} OpticGlasses. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`;
};

// Welcome email template
const welcomeEmail = (userData) => {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to OpticGlasses</title>
    <style>
        body { margin: 0; padding: 0; background-color: #101415; font-family: 'Arial', sans-serif; color: #FEFDED; }
        .container { width: 100%; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #101415; }
        .header { text-align: center; margin-bottom: 40px; }
        .logo { font-size: 28px; font-weight: bold; color: #FEFDED; letter-spacing: 1px; text-transform: uppercase; }
        .content { background-color: #15191a; padding: 40px; border-radius: 12px; border: 1px solid #2a2a2a; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3); text-align: center; }
        h1 { font-size: 26px; margin-bottom: 24px; color: #FEFDED; font-weight: 600; }
        .btn { display: inline-block; padding: 16px 32px; background-color: #FEFDED; color: #101415; text-decoration: none; font-weight: bold; border-radius: 8px; font-size: 16px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 40px; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">OpticGlasses</div>
        </div>
        <div class="content">
            <h1>Welcome, ${userData.name}! 👋</h1>
            <p>Thank you for joining OpticGlasses! We're excited to help you find the perfect eyewear.</p>
            <p style="color: #d1d1d1;">Explore our premium collection of glasses and sunglasses, all crafted with the finest materials and latest designs.</p>
            <a href="${process.env.FRONT_END_URL}" class="btn">Start Shopping</a>
        </div>
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} OpticGlasses. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`;
};

// Password reset email template
const passwordReset = (resetData) => {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password</title>
    <style>
        body { margin: 0; padding: 0; background-color: #101415; font-family: 'Arial', sans-serif; color: #FEFDED; }
        .container { width: 100%; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #101415; }
        .header { text-align: center; margin-bottom: 40px; }
        .logo { font-size: 28px; font-weight: bold; color: #FEFDED; letter-spacing: 1px; text-transform: uppercase; }
        .content { background-color: #15191a; padding: 40px; border-radius: 12px; border: 1px solid #2a2a2a; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3); text-align: center; }
        h1 { font-size: 26px; margin-bottom: 24px; color: #FEFDED; font-weight: 600; }
        .btn { display: inline-block; padding: 16px 32px; background-color: #FEFDED; color: #101415; text-decoration: none; font-weight: bold; border-radius: 8px; font-size: 16px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 40px; font-size: 12px; color: #666; }
        .link-text { word-break: break-all; color: #4a90e2; font-size: 12px; margin-top: 10px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">OpticGlasses</div>
        </div>
        <div class="content">
            <h1>Reset Your Password</h1>
            <p>We received a request to reset the password for your OpticGlasses account. Click the button below to proceed.</p>
            <a href="${resetData.resetLink}" class="btn">Reset Password</a>
            <p style="margin-top: 30px; font-size: 14px; color: #888;">
                Or copy and paste this link into your browser:<br>
                <a href="${resetData.resetLink}" class="link-text" style="color: #888; text-decoration: underline;">${resetData.resetLink}</a>
            </p>
            <p style="margin-top: 20px; font-size: 14px; color: #666;">
                If you didn't request this change, please ignore this email. Your password will remain unchanged.
            </p>
        </div>
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} OpticGlasses. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`;
};

module.exports = { 
    forgotPasswordTemplate,
    orderConfirmation,
    orderStatusUpdate,
    shippingNotification,
    welcomeEmail,
    passwordReset,
};
