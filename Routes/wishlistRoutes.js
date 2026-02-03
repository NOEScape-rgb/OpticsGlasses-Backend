const express = require('express');
const router = express.Router();
const {
    getWishlistController,
    addToWishlistController,
    removeFromWishlistController,
    clearWishlistController,
    checkWishlistController,
    getWishlistCountController,
} = require('../controllers/wishlistController');
const { verifyToken } = require('../middleware/authMiddleware');

/**
 * @route   GET /api/wishlist
 * @desc    Get user's wishlist
 * @access  Private
 */
router.get('/', verifyToken, getWishlistController);

/**
 * @route   POST /api/wishlist
 * @desc    Add product to wishlist
 * @access  Private
 */
router.post('/', verifyToken, addToWishlistController);

/**
 * @route   DELETE /api/wishlist/:productId
 * @desc    Remove product from wishlist
 * @access  Private
 */
router.delete('/:productId', verifyToken, removeFromWishlistController);

/**
 * @route   DELETE /api/wishlist
 * @desc    Clear entire wishlist
 * @access  Private
 */
router.delete('/', verifyToken, clearWishlistController);

/**
 * @route   GET /api/wishlist/check/:productId
 * @desc    Check if product is in wishlist
 * @access  Private
 */
router.get('/check/:productId', verifyToken, checkWishlistController);

/**
 * @route   GET /api/wishlist/count
 * @desc    Get wishlist count
 * @access  Private
 */
router.get('/count', verifyToken, getWishlistCountController);

module.exports = router;