const express = require('express');
const router = express.Router();
const {
    getInventorySummaryController,
    getLowStockProductsController,
    getOutOfStockProductsController,
    restockProductController,
    updateProductStockController,
} = require('../controllers/inventoryController');
const { verifyAdminToken } = require('../middleware/authMiddleware');

/**
 * @route   GET /api/inventory/summary
 * @desc    Get inventory summary
 * @access  Private (Admin)
 */
router.get('/summary', verifyAdminToken, getInventorySummaryController);

/**
 * @route   GET /api/inventory/low-stock
 * @desc    Get low stock products
 * @access  Private (Admin)
 */
router.get('/low-stock', verifyAdminToken, getLowStockProductsController);

/**
 * @route   GET /api/inventory/out-of-stock
 * @desc    Get out of stock products
 * @access  Private (Admin)
 */
router.get('/out-of-stock', verifyAdminToken, getOutOfStockProductsController);

/**
 * @route   POST /api/inventory/restock/:productId
 * @desc    Restock product
 * @access  Private (Admin)
 */
router.post('/restock/:productId', verifyAdminToken, restockProductController);

/**
 * @route   PATCH /api/inventory/update-stock/:productId
 * @desc    Update product stock manually
 * @access  Private (Admin)
 */
router.patch('/update-stock/:productId', verifyAdminToken, updateProductStockController);

module.exports = router;