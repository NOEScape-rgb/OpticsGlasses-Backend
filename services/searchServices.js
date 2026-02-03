const Product = require('../models/Product');

// Search products with advanced filtering
const searchProducts = async (searchParams) => {
    const {
        q, // search query
        category,
        brand,
        minPrice,
        maxPrice,
        inStock,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        page = 1,
        limit = 20
    } = searchParams;

    // Build search query
    let searchQuery = {};

    // Text search across name and description
    if (q) {
        searchQuery.$or = [
            { name: { $regex: q, $options: 'i' } },
            { description: { $regex: q, $options: 'i' } },
            { brand: { $regex: q, $options: 'i' } },
            { sku: { $regex: q, $options: 'i' } }
        ];
    }

    // Category filter
    if (category) {
        searchQuery.category = category;
    }

    // Brand filter
    if (brand) {
        searchQuery.brand = { $regex: brand, $options: 'i' };
    }

    // Price range filter
    if (minPrice || maxPrice) {
        searchQuery.price = {};
        if (minPrice) searchQuery.price.$gte = parseFloat(minPrice);
        if (maxPrice) searchQuery.price.$lte = parseFloat(maxPrice);
    }

    // Stock filter
    if (inStock === 'true') {
        searchQuery.stock = { $gt: 0 };
        searchQuery.status = { $ne: 'Out of Stock' };
    }

    // Only show active products (not drafts)
    searchQuery.status = { $ne: 'Draft' };

    // Build sort object
    const sortObj = {};
    sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute search with pagination
    const skip = (page - 1) * limit;
    
    const [products, totalCount] = await Promise.all([
        Product.find(searchQuery)
            .sort(sortObj)
            .skip(skip)
            .limit(parseInt(limit))
            .select('-__v'),
        Product.countDocuments(searchQuery)
    ]);

    return {
        products,
        pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalCount / limit),
            totalProducts: totalCount,
            hasNextPage: page * limit < totalCount,
            hasPrevPage: page > 1
        }
    };
};

// Get search suggestions (autocomplete)
const getSearchSuggestions = async (query, limit = 10) => {
    if (!query || query.length < 2) {
        return [];
    }

    const suggestions = await Product.aggregate([
        {
            $match: {
                $or: [
                    { name: { $regex: query, $options: 'i' } },
                    { brand: { $regex: query, $options: 'i' } }
                ],
                status: { $ne: 'Draft' }
            }
        },
        {
            $project: {
                name: 1,
                brand: 1,
                category: 1,
                mainImage: 1,
                price: 1
            }
        },
        { $limit: parseInt(limit) }
    ]);

    return suggestions;
};

// Get popular search terms (based on product names and brands)
const getPopularSearchTerms = async (limit = 10) => {
    const popularTerms = await Product.aggregate([
        { $match: { status: { $ne: 'Draft' } } },
        {
            $group: {
                _id: '$brand',
                count: { $sum: 1 },
                avgRating: { $avg: '$ratingsAverage' }
            }
        },
        { $sort: { count: -1 } },
        { $limit: parseInt(limit) },
        {
            $project: {
                term: '$_id',
                count: 1,
                avgRating: 1,
                _id: 0
            }
        }
    ]);

    return popularTerms;
};

// Get filter options for search page
const getFilterOptions = async () => {
    const [categories, brands, priceRange] = await Promise.all([
        // Get all categories
        Product.distinct('category', { status: { $ne: 'Draft' } }),
        
        // Get all brands
        Product.distinct('brand', { status: { $ne: 'Draft' } }),
        
        // Get price range
        Product.aggregate([
            { $match: { status: { $ne: 'Draft' } } },
            {
                $group: {
                    _id: null,
                    minPrice: { $min: '$price' },
                    maxPrice: { $max: '$price' }
                }
            }
        ])
    ]);

    return {
        categories: categories.filter(Boolean),
        brands: brands.filter(Boolean),
        priceRange: priceRange[0] || { minPrice: 0, maxPrice: 1000 }
    };
};

module.exports = {
    searchProducts,
    getSearchSuggestions,
    getPopularSearchTerms,
    getFilterOptions,
};