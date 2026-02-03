const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    customer: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Order must belong to a User"],
    },
    items: [
      {
        product: {
          type: mongoose.Schema.ObjectId,
          ref: "Product",
          required: [true, "Order item must belong to a Product"],
        },
        name: String, // Snapshot of product name
        sku: String, // Snapshot of product SKU
        quantity: {
          type: Number,
          required: [true, "Quantity is required"],
          min: 1,
        },
        price: {
          type: Number,
          required: [true, "Price is required"],
          min: 0,
        }, // Snapshot of product price at time of purchase
      },
    ],
    subtotal: {
      type: Number,
      required: [true, "Subtotal is required"],
      min: 0,
    },
    tax: {
      type: Number,
      default: 0,
      min: 0,
    },
    shippingCost: {
      type: Number,
      default: 0,
      min: 0,
    },
    total: {
      type: Number,
      required: [true, "Total is required"],
      min: 0,
    },
    status: {
      type: String,
      enum: ["Processing", "Shipped", "Delivered", "Cancelled"],
      default: "Processing",
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Refunded", "Partially Refunded"],
      default: "Pending",
    },
    paymentMethod: {
      type: String,
      trim: true,
    },
    shippingAddress: {
      // Snapshot of the shipping address at the time of order
      street: String,
      city: String,
      state: String,
      zip: String,
      country: String,
    },
    tracking: {
      carrier: String,
      number: String,
    },
    cancellation: {
      reason: String,
      notes: String,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
    collection: "orders",
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Pre-validate hook to generate order number if not provided
orderSchema.pre("validate", async function () {
  if (this.isNew && !this.orderNumber) {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, "0");
    const day = now.getDate().toString().padStart(2, "0");
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const seconds = now.getSeconds().toString().padStart(2, "0");
    const random = Math.floor(1000 + Math.random() * 9000); // 4-digit random number

    this.orderNumber = `#ORD-${year}${month}${day}-${hours}${minutes}${seconds}-${random}`;
  }
});

// Populate customer and product details on find
orderSchema.pre(/^find/, async function () {
  this.populate({
    path: "customer",
    select: "firstName lastName email", // Only select relevant user fields
  }).populate({
    path: "items.product",
    select: "name sku price mainImage", // Only select relevant product fields
  });
});

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
