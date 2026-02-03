const searchServices = require('../services/searchServices');

// Search products
const searchProductsController = async (req, res) => {
    try {
        const result = await searchServices.searchProducts(req.query);
        
        res.status(200).json({
            isStatus: true,
            results: result.products.length,
            msg: 'Products search completed successfully',
            data: result.products,
            pagination: result.pagination,
        });
    } catch (error) {
        res.status(500).json({
            isStatus: false,
            msg: error.message || 'Internal Server Error',
            data: null,
        });
    }
};

// Get search suggestions
const getSearchSuggestionsController = async (req, res) => {
    try {
        const { q, limit } = req.query;
        const suggestions = await searchServices.getSearchSuggestions(q, limit);
        
        res.status(200).json({
            isStatus: true,
            results: suggestions.length,
            msg: 'Search suggestions retrieved successfully',
            data: suggestions,
        });
    } catch (error) {
        res.status(500).json({
            isStatus: false,
            msg: error.message || 'Internal Server Error',
            data: null,
        });
    }
};

// Get popular search terms
const getPopularSearchTermsController = async (req, res) => {
    try {
        const { limit } = req.query;
        const terms = await searchServices.getPopularSearchTerms(limit);
        
        res.status(200).json({
            isStatus: true,
            results: terms.length,
            msg: 'Popular search terms retrieved successfully',
            data: terms,
        });
    } catch (error) {
        res.status(500).json({
            isStatus: false,
            msg: error.message || 'Internal Server Error',
            data: null,
        });
    }
};

// Get filter options
const getFilterOptionsController = async (req, res) => {
    try {
        const options = await searchServices.getFilterOptions();
        
        res.status(200).json({
            isStatus: true,
            msg: 'Filter options retrieved successfully',
            data: options,
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
    searchProductsController,
    getSearchSuggestionsController,
    getPopularSearchTermsController,
    getFilterOptionsController,
};