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

module.exports = { forgotPasswordTemplate };
