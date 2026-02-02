const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    sku: {
      type: String,
      required: [true, "SKU is required"],
      unique: true,
      uppercase: true,
      trim: true,
      minlength: 3,
      maxlength: 20,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    salePrice: {
      type: Number,
      min: [0, "Sale price cannot be negative"],
      validate: {
        validator: function (val) {
          return val < this.price;
        },
        message: "Sale price ({VALUE}) must be less than the regular price",
      },
    },
    currency: {
      type: String,
      default: "USD",
      enum: ["USD", "EUR", "GBP", "CAD", "AUD"], // Extended common currencies
    },
    stock: {
      type: Number,
      default: 0,
      min: [0, "Stock cannot be negative"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: {
        values: ["Sunglasses", "Eyeglasses", "Lenses", "Accessories"],
        message: "{VALUE} is not a valid category",
      },
    },
    brand: {
      type: String,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    status: {
      type: String,
      default: "Draft",
      enum: {
        values: ["Active", "Draft", "Out of Stock", "Low Stock"],
        message: "{VALUE} is not a valid status",
      },
    },
    images: {
      type: [String], // Array of URLs
    },
    mainImage: {
      type: String, // URL for the main image
    },
    ratingsAverage: {
      type: Number,
      default: 0,
      min: [0, "Rating must be above 0"],
      max: [5, "Rating must be below 5.0"],
      set: (val) => Math.round(val * 10) / 10, // 4.666 -> 4.7
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
      min: [0, "Ratings quantity cannot be negative"],
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
    collection: "products",
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Index for faster querying
productSchema.index({ category: 1 });
productSchema.index({ brand: 1 });
productSchema.index({ price: 1 });
productSchema.index({ ratingsAverage: -1 });

// Virtual property to set mainImage if not explicitly provided and images array is not empty
productSchema.virtual("derivedMainImage").get(function () {
  if (!this.mainImage && this.images && this.images.length > 0) {
    return this.images[0];
  }
  return this.mainImage;
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
