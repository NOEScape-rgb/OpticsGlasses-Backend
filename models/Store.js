const mongoose = require("mongoose");

const storeSchema = new mongoose.Schema(
  {
    storeProfile: {
      name: {
        type: String,
        required: [true, "Store name is required"],
        trim: true,
        maxlength: 100,
      },
      email: {
        type: String,
        required: [true, "Store email is required"],
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, "Please use a valid email address"],
      },
      phone: {
        type: String,
        trim: true,
      },
      address: {
        type: String,
        trim: true,
        maxlength: 255,
      },
      currency: {
        type: String,
        default: "PKR",
        trim: true,
        minlength: 3,
        maxlength: 3,
      },
      timezone: {
        type: String,
        default: "UTC",
        trim: true,
      },
      language: {
        type: String,
        default: "en",
        trim: true,
        minlength: 2,
        maxlength: 2,
      },
    },
    shipping: {
      freeThreshold: {
        type: Number,
        min: 0,
        default: 50,
      },
      standardRate: {
        type: Number,
        min: 0,
        default: 399,
      },
      expressRate: {
        type: Number,
        min: 0,
        default: 999,
      },
      deliveryEstimate: {
        type: String,
        trim: true,
        maxlength: 100,
      },
    },
    tax: {
      rate: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },
      label: {
        type: String,
        default: "Tax",
        trim: true,
      },
      active: {
        type: Boolean,
        default: true
      }
    },
    cms: {
      hero: {
        title: { type: String, trim: true, maxlength: 150 },
        subtitle: { type: String, trim: true, maxlength: 250 },
        cta: { type: String, trim: true, maxlength: 50 },
        active: { type: Boolean, default: false },
      },
      heroSlides: [
        {
          id: { type: String, required: true }, // Unique identifier for the slide
          imgSrc: { type: String, required: true, trim: true },
          brand: { type: String, trim: true, maxlength: 50 },
          active: { type: Boolean, default: true },
        },
      ],
      promo: {
        text: { type: String, trim: true, maxlength: 200 },
        bgColor: { type: String, default: "#000000", trim: true },
        textColor: { type: String, default: "#FFFFFF", trim: true },
        alertColor: { type: String, default: "#ff4d4d", trim: true },
        isMarquee: { type: Boolean, default: false },
        speed: { type: Number, default: 20 },
        active: { type: Boolean, default: false },
      },
      featuredLimit: {
        type: Number,
        min: 1,
        max: 20, // Reasonable limit
        default: 4,
      },
    },
    seo: {
      title: { type: String, trim: true, maxlength: 150 },
      description: { type: String, trim: true, maxlength: 250 },
      keywords: { type: String, trim: true, maxlength: 300 },
    },
    paymentMethods: [
      {
        name: { type: String, required: true, trim: true }, // e.g., Stripe, PayPal, COD
        provider: { type: String, trim: true }, // e.g., stripe, paypal
        instructions: { type: String, trim: true }, // For bank transfer instructions
        type: {
          type: String,
          enum: ["stripe", "cod", "bankTransfer"],
          default: "cod"
        },
        status: {
          type: String,
          enum: ["active", "inactive"],
          default: "inactive",
        },
        isDefault: { type: Boolean, default: false },
      },
    ],
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
    collection: "storeConfig", // Explicitly set collection name
    // Since this is a singleton, we can enforce that only one document can exist.
    // This requires a bit more complex setup, often handled at the application level
    // or by ensuring only one document is ever created and updated.
    // For Mongoose schema, we'll rely on application logic to maintain singularity.
  },
);

// Prevent multiple store documents from being created.
// This is a schema-level check, but application logic is primary for singleton enforcement.
storeSchema.pre("save", async function () {
  const existingStore = await this.constructor.findOne();

  // If creating a new document (this.isNew) and one already exists, throw an error
  if (existingStore && this.isNew) {
    throw new Error(
      "Singleton violation: Only one store configuration document can exist.",
    );
  }
});

// Method to ensure only one default payment method
storeSchema.pre("save", async function () {
  let defaultCount = 0;
  if (this.paymentMethods) {
    this.paymentMethods.forEach((method) => {
      if (method.isDefault) {
        defaultCount++;
      }
    });
  }

  if (defaultCount > 1) {
    throw new Error("Cannot have more than one default payment method.");
  }
});

const Store = mongoose.model("Store", storeSchema);

module.exports = Store;
