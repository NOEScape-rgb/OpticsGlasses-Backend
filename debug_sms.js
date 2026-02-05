require('dotenv').config();
const { sendSMS } = require('./utils/sms');

const testSMS = async () => {
    console.log("Testing SMS Gateway...");
    console.log("User:", process.env.SMS_GATEWAY_USER ? "Set" : "Missing");
    console.log("Pass:", process.env.SMS_GATEWAY_PASS ? "Set" : "Missing");
    console.log("Device:", process.env.SMS_GATEWAY_DEVICE_ID ? "Set" : "Missing");

    const result = await sendSMS('+923001234567', 'Test message from backend debugger');
    console.log("Result:", JSON.stringify(result, null, 2));
};

testSMS();
