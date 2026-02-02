const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, "Coupon code is required"],
      unique: true,
      uppercase: true,
      trim: true,
      minlength: 3,
      maxlength: 20,
    },
    type: {
      type: String,
      required: [true, "Coupon type is required"],
      enum: {
        values: ["percentage", "fixed"],
        message: "{VALUE} is not a valid coupon type",
      },
    },
    value: {
      type: Number,
      required: [true, "Coupon value is required"],
      min: [0, "Coupon value cannot be negative"],
      // Validate value based on type
      validate: {
        validator: function (val) {
          if (this.type === "percentage") {
            return val >= 0 && val <= 100;
          }
          return val >= 0;
        },
        message: (props) => {
          if (props.value < 0) return "Coupon value cannot be negative";
          if (props.this.type === "percentage")
            return "Percentage coupon value must be between 0 and 100";
          return "Invalid coupon value";
        },
      },
    },
    minOrder: {
      type: Number,
      default: 0,
      min: [0, "Minimum order value cannot be negative"],
    },
    maxUses: {
      type: Number,
      // No explicit required, as it's optional
      min: [1, "Maximum uses must be at least 1 if specified"],
    },
    usedCount: {
      type: Number,
      default: 0,
      min: [0, "Used count cannot be negative"],
    },
    status: {
      type: String,
      enum: {
        values: ["Active", "Expired", "Disabled"],
        message: "{VALUE} is not a valid coupon status",
      },
      default: "Active",
    },
    expiresAt: {
      type: Date,
      required: [true, "Expiry date is required"],
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
    collection: "coupons",
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Index for faster querying on code
couponSchema.index({ code: 1 }, { unique: true });

// Index for expiry date to quickly find expired coupons
couponSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // Automatically removes expired documents

// Method to check if the coupon is currently active and valid
couponSchema.methods.isActive = function () {
  const now = new Date();
  return (
    this.status === "Active" &&
    this.expiresAt > now &&
    this.usedCount < (this.maxUses || Infinity) // Check maxUses if it exists
  );
};

const Coupon = mongoose.model("Coupon", couponSchema);

module.exports = Coupon;
