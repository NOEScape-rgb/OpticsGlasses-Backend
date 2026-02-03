require("dotenv").config();
const mongoose = require("mongoose");
const Order = require("./models/Order");

async function runTest() {
    try {
        console.log("Connecting to DB...", process.env.DATABASE_URI);
        await mongoose.connect(process.env.DATABASE_URI + "/opticsGlasses");
        console.log("Connected.");

        // Valid order data
        const userId = new mongoose.Types.ObjectId();
        const productId = new mongoose.Types.ObjectId();

        const orderData = {
            customer: userId,
            items: [{
                product: productId,
                name: "Test Prod",
                sku: "TEST-SKU",
                quantity: 1,
                price: 100
            }],
            subtotal: 100,
            total: 100,
            shippingAddress: { // Added required field
                street: "123 Main St",
                city: "Test City",
                state: "TS",
                zip: "12345",
                country: "Test Country"
            },
            paymentMethod: "COD"
        };

        console.log("Creating Order...");
        const order = await Order.create(orderData);
        console.log("Order created successfully:", order.orderNumber);

        process.exit(0);
    } catch (error) {
        console.error("FAILURE:", error);
        if (error.stack) console.error(error.stack);
        process.exit(1);
    }
}

runTest();
