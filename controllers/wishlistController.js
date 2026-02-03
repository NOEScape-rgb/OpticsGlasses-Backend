const wishlistServices = require('../services/wishlistServices');

// Get user's wishlist
const getWishlistController = async (req, res) => {
    try {
        const userId = req.user.id;
        const wishlist = await wishlistServices.getUserWishlist(userId);
        
        res.status(200).json({
            isStatus: true,
            results: wishlist.products.length,
            msg: 'Wishlist retrieved successfully',
            data: wishlist,
        });
    } catch (error) {
        res.status(500).json({
            isStatus: false,
            msg: error.message || 'Internal Server Error',
            data: null,
        });
    }
};

// Add product to wishlist
const addToWishlistController = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId } = req.body;
        
        if (!productId) {
            return res.status(400).json({
                isStatus: false,
                msg: 'Product ID is required',
                data: null,
            });
        }
        
        const wishlist = await wishlistServices.addToWishlist(userId, productId);
        
        res.status(200).json({
            isStatus: true,
            msg: 'Product added to wishlist successfully',
            data: wishlist,
        });
    } catch (error) {
        if (error.message.includes('already in wishlist')) {
            return res.status(409).json({
                isStatus: false,
                msg: error.message,
                data: null,
            });
        }
        
        if (error.message.includes('not found')) {
            return res.status(404).json({
                isStatus: false,
                msg: error.message,
                data: null,
            });
        }
        
        res.status(500).json({
            isStatus: false,
            msg: error.message || 'Internal Server Error',
            data: null,
        });
    }
};

// Remove product from wishlist
const removeFromWishlistController = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId } = req.params;
        
        const wishlist = await wishlistServices.removeFromWishlist(userId, productId);
        
        res.status(200).json({
            isStatus: true,
            msg: 'Product removed from wishlist successfully',
            data: wishlist,
        });
    } catch (error) {
        if (error.message.includes('not found')) {
            return res.status(404).json({
                isStatus: false,
                msg: error.message,
                data: null,
            });
        }
        
        res.status(500).json({
            isStatus: false,
            msg: error.message || 'Internal Server Error',
            data: null,
        });
    }
};

// Clear wishlist
const clearWishlistController = async (req, res) => {
    try {
        const userId = req.user.id;
        const wishlist = await wishlistServices.clearWishlist(userId);
        
        res.status(200).json({
            isStatus: true,
            msg: 'Wishlist cleared successfully',
            data: wishlist,
        });
    } catch (error) {
        res.status(500).json({
            isStatus: false,
            msg: error.message || 'Internal Server Error',
            data: null,
        });
    }
};

// Check if product is in wishlist
const checkWishlistController = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId } = req.params;
        
        const isInWishlist = await wishlistServices.isInWishlist(userId, productId);
        
        res.status(200).json({
            isStatus: true,
            msg: 'Wishlist check completed',
            data: { isInWishlist },
        });
    } catch (error) {
        res.status(500).json({
            isStatus: false,
            msg: error.message || 'Internal Server Error',
            data: null,
        });
    }
};

// Get wishlist count
const getWishlistCountController = async (req, res) => {
    try {
        const userId = req.user.id;
        const count = await wishlistServices.getWishlistCount(userId);
        
        res.status(200).json({
            isStatus: true,
            msg: 'Wishlist count retrieved successfully',
            data: { count },
        });
    } catch (error) {
        res.status(500).json({
            isStatus: false,
            msg: error.message || 'Internal Server Error',
            data: null,
        });
    }
};

module.exports = {
    getWishlistController,
    addToWishlistController,
    removeFromWishlistController,
    clearWishlistController,
    checkWishlistController,
    getWishlistCountController,
};