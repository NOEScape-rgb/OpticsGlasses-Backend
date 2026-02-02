const productServices = require("../services/productServices");

// Create Product
const createProductController = async (req, res) => {
    try {
        // If files are uploaded, add their paths to the product data
        if (req.files && req.files.length > 0) {
            const imagePaths = req.files.map((file) => file.path); // Cloudinary URL
            req.body.images = imagePaths;
        }

        const product = await productServices.createProduct(req.body);
        res.status(201).json({
            isStatus: true,
            msg: "Product created successfully",
            data: product,
        });
    } catch (error) {
        res.status(400).json({
            isStatus: false,
            msg: error.message || "Bad Request",
            data: null,
        });
    }
};

// Get All Products
const getAllProductsController = async (req, res) => {
    try {
        const products = await productServices.getAllProducts(req.query);
        res.status(200).json({
            isStatus: true,
            results: products.length,
            msg: "Products retrieved successfully",
            data: products,
        });
    } catch (error) {
        res.status(500).json({
            isStatus: false,
            msg: error.message || "Internal Server Error",
            data: null,
        });
    }
};

// Get Single Product
const getProductByIdController = async (req, res) => {
    try {
        const product = await productServices.getProductById(req.params.id);
        res.status(200).json({
            isStatus: true,
            msg: "Product retrieved successfully",
            data: product,
        });
    } catch (error) {
        if (error.message === "Product not found") {
            return res.status(404).json({
                isStatus: false,
                msg: "Product not found",
                data: null,
            });
        }
        res.status(500).json({
            isStatus: false,
            msg: error.message || "Internal Server Error",
            data: null,
        });
    }
};

// Update Product
const updateProductController = async (req, res) => {
    try {
        const product = await productServices.updateProduct(req.params.id, req.body);
        res.status(200).json({
            isStatus: true,
            msg: "Product updated successfully",
            data: product,
        });
    } catch (error) {
        if (error.message === "Product not found") {
            return res.status(404).json({
                isStatus: false,
                msg: "Product not found",
                data: null,
            });
        }
        res.status(400).json({
            isStatus: false,
            msg: error.message || "Bad Request",
            data: null,
        });
    }
};

// Delete Product
const deleteProductController = async (req, res) => {
    try {
        await productServices.deleteProduct(req.params.id);
        res.status(200).json({
            isStatus: true,
            msg: "Product deleted successfully",
            data: null,
        });
    } catch (error) {
        if (error.message === "Product not found") {
            return res.status(404).json({
                isStatus: false,
                msg: "Product not found",
                data: null,
            });
        }
        res.status(500).json({
            isStatus: false,
            msg: error.message || "Internal Server Error",
            data: null,
        });
    }
};

module.exports = {
    createProductController,
    getAllProductsController,
    getProductByIdController,
    updateProductController,
    deleteProductController,
};
