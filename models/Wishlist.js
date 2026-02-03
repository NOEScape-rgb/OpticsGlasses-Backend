const mongoose = require("mongoose");

const wishlistSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.ObjectId,
            ref: "User",
            required: [true, "Wishlist must belong to a user"],
        },
        products: [
            {
                product: {
                    type: mongoose.Schema.ObjectId,
                    ref: "Product",
                    required: true,
                },
                addedAt: {
                    type: Date,
                    default: Date.now,
                },
            }
        ],
    },
    {
        timestamps: true,
        collection: "wishlists",
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Ensure one wishlist per user
wishlistSchema.index({ user: 1 }, { unique: true });

// Populate products when querying
wishlistSchema.pre(/^find/, function () {
    this.populate({
        path: "products.product",
        select: "name price salePrice mainImage images category brand stock status ratingsAverage",
    });
});

const Wishlist = mongoose.model("Wishlist", wishlistSchema);

module.exports = Wishlist;