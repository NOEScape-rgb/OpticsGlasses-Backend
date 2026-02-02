const express = require("express");
const router = express.Router();
const {
    createProductController,
    getAllProductsController,
    getProductByIdController,
    updateProductController,
    deleteProductController,
} = require("../controllers/productController");
const { verifyToken } = require("../middleware/authMiddleware");
const upload = require("../utils/upload");

/**
 * @route   GET /api/products
 * @desc    Get all products with filtering, sorting, and pagination
 * @access  Public
 */
router.get("/", getAllProductsController);

/**
 * @route   GET /api/products/:id
 * @desc    Get single product details
 * @access  Public
 */
router.get("/:id", getProductByIdController);

/**
 * @route   POST /api/products
 * @desc    Create a new product
 * @access  Private (Admin)
 */
// Use upload.array('images') to handle multiple file uploads under the key 'images'
router.post("/", verifyToken, upload.array("images", 5), createProductController);

/**
 * @route   PATCH /api/products/:id
 * @desc    Update a product
 * @access  Private (Admin)
 */
router.patch("/:id", verifyToken, updateProductController);

/**
 * @route   DELETE /api/products/:id
 * @desc    Delete a product
 * @access  Private (Admin)
 */
router.delete("/:id", verifyToken, deleteProductController);

module.exports = router;
