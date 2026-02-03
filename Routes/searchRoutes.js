const express = require('express');
const router = express.Router();
const {
    searchProductsController,
    getSearchSuggestionsController,
    getPopularSearchTermsController,
    getFilterOptionsController,
} = require('../controllers/searchController');

/**
 * @route   GET /api/search/products
 * @desc    Search products with filters
 * @access  Public
 */
router.get('/products', searchProductsController);

/**
 * @route   GET /api/search/suggestions
 * @desc    Get search suggestions for autocomplete
 * @access  Public
 */
router.get('/suggestions', getSearchSuggestionsController);

/**
 * @route   GET /api/search/popular-terms
 * @desc    Get popular search terms
 * @access  Public
 */
router.get('/popular-terms', getPopularSearchTermsController);

/**
 * @route   GET /api/search/filter-options
 * @desc    Get available filter options
 * @access  Public
 */
router.get('/filter-options', getFilterOptionsController);

module.exports = router;