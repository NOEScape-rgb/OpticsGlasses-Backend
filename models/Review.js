const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.ObjectId,
      ref: "Product",
      required: [true, "Review must belong to a product"],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Review must belong to a user"],
    },
    rating: {
      type: Number,
      min: [1, "Rating must be at least 1.0"],
      max: [5, "Rating must be at most 5.0"],
      required: [true, "Review must have a rating"],
    },
    comment: {
      type: String,
      trim: true,
      maxlength: [500, "Review comment cannot be more than 500 characters"],
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields for 'date'
    collection: "reviews",
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Prevent user from creating more than one review per product
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

// Static method to calculate average ratings on the product
reviewSchema.statics.calcAverageRatings = async function (productId) {
  const stats = await this.aggregate([
    {
      $match: { product: productId, status: "Approved" }, // Only approved reviews
    },
    {
      $group: {
        _id: "$product",
        nRating: { $sum: 1 },
        avgRating: { $avg: "$rating" },
      },
    },
  ]);

  if (stats.length > 0) {
    await mongoose.model("Product").findByIdAndUpdate(productId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await mongoose.model("Product").findByIdAndUpdate(productId, {
      ratingsQuantity: 0,
      ratingsAverage: 0,
    });
  }
};

// Call calcAverageRatings after save
reviewSchema.post("save", function () {
  // 'this' points to current review
  this.constructor.calcAverageRatings(this.product);
});

// Call calcAverageRatings after findOneAndDelete
reviewSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    await doc.constructor.calcAverageRatings(doc.product);
  }
});

// Populate product and user details on find
reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "firstName lastName avatarUrl", // Only select relevant user fields
  }).populate({
    path: "product",
    select: "name mainImage", // Only select relevant product fields
  });
  next();
});

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
