const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');

// Get user's wishlist
const getUserWishlist = async (userId) => {
    try {
        let wishlist = await Wishlist.findOne({ user: userId });
        
        if (!wishlist) {
            // Create empty wishlist if doesn't exist
            wishlist = await Wishlist.create({ user: userId, products: [] });
        }
        
        return wishlist;
    } catch (error) {
        throw new Error(`Failed to get wishlist: ${error.message}`);
    }
};

// Add product to wishlist
const addToWishlist = async (userId, productId) => {
    try {
        // Check if product exists
        const product = await Product.findById(productId);
        if (!product) {
            throw new Error('Product not found');
        }

        let wishlist = await Wishlist.findOne({ user: userId });
        
        if (!wishlist) {
            // Create new wishlist with the product
            wishlist = await Wishlist.create({
                user: userId,
                products: [{ product: productId }]
            });
        } else {
            // Check if product already in wishlist
            const existingProduct = wishlist.products.find(
                item => item.product.toString() === productId
            );
            
            if (existingProduct) {
                throw new Error('Product already in wishlist');
            }
            
            // Add product to existing wishlist
            wishlist.products.push({ product: productId });
            await wishlist.save();
        }
        
        return wishlist;
    } catch (error) {
        throw new Error(`Failed to add to wishlist: ${error.message}`);
    }
};

// Remove product from wishlist
const removeFromWishlist = async (userId, productId) => {
    try {
        const wishlist = await Wishlist.findOne({ user: userId });
        
        if (!wishlist) {
            throw new Error('Wishlist not found');
        }
        
        const productIndex = wishlist.products.findIndex(
            item => item.product.toString() === productId
        );
        
        if (productIndex === -1) {
            throw new Error('Product not found in wishlist');
        }
        
        wishlist.products.splice(productIndex, 1);
        await wishlist.save();
        
        return wishlist;
    } catch (error) {
        throw new Error(`Failed to remove from wishlist: ${error.message}`);
    }
};

// Clear entire wishlist
const clearWishlist = async (userId) => {
    try {
        const wishlist = await Wishlist.findOne({ user: userId });
        
        if (!wishlist) {
            throw new Error('Wishlist not found');
        }
        
        wishlist.products = [];
        await wishlist.save();
        
        return wishlist;
    } catch (error) {
        throw new Error(`Failed to clear wishlist: ${error.message}`);
    }
};

// Check if product is in user's wishlist
const isInWishlist = async (userId, productId) => {
    try {
        const wishlist = await Wishlist.findOne({ user: userId });
        
        if (!wishlist) {
            return false;
        }
        
        return wishlist.products.some(
            item => item.product.toString() === productId
        );
    } catch (error) {
        throw new Error(`Failed to check wishlist: ${error.message}`);
    }
};

// Get wishlist count
const getWishlistCount = async (userId) => {
    try {
        const wishlist = await Wishlist.findOne({ user: userId });
        return wishlist ? wishlist.products.length : 0;
    } catch (error) {
        throw new Error(`Failed to get wishlist count: ${error.message}`);
    }
};

module.exports = {
    getUserWishlist,
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
    isInWishlist,
    getWishlistCount,
};