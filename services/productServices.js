const Product = require("../models/Product");

// Create a new product
const createProduct = async (productData) => {
    // Auto-set mainImage if not provided but images array exists
    if (!productData.mainImage && productData.images && productData.images.length > 0) {
        productData.mainImage = productData.images[0];
    }

    const product = await Product.create(productData);
    return product;
};

// Get all products with filtering, sorting, and pagination
const getAllProducts = async (queryString) => {
    // 1. Filtering
    // Create a shallow copy of query object
    const queryObj = { ...queryString };
    const excludedFields = ["page", "sort", "limit", "fields"];
    excludedFields.forEach((el) => delete queryObj[el]);

    // Advanced filtering (gte, gt, lte, lt)
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    let query = Product.find(JSON.parse(queryStr));

    // 2. Sorting
    if (queryString.sort) {
        const sortBy = queryString.sort.split(",").join(" ");
        query = query.sort(sortBy);
    } else {
        query = query.sort("-createdAt"); // Default sort by newest
    }

    // 3. Field Limiting
    if (queryString.fields) {
        const fields = queryString.fields.split(",").join(" ");
        query = query.select(fields);
    } else {
        query = query.select("-__v");
    }

    // 4. Pagination
    const page = queryString.page * 1 || 1;
    const limit = queryString.limit * 1 || 20; // Default limit 20
    const skip = (page - 1) * limit;

    query = query.skip(skip).limit(limit);

    const products = await query;
    return products;
};

// Get single product by ID
const getProductById = async (id) => {
    const product = await Product.findById(id);
    if (!product) {
        throw new Error("Product not found");
    }
    return product;
};

// Update product
const updateProduct = async (id, updateData) => {
    const product = await Product.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
    });
    if (!product) {
        throw new Error("Product not found");
    }
    return product;
};

// Delete product
const deleteProduct = async (id) => {
    const product = await Product.findByIdAndDelete(id);
    if (!product) {
        throw new Error("Product not found");
    }
    return product;
};

module.exports = {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct,
};
