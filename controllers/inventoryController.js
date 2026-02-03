const inventoryServices = require('../services/inventoryServices');

// Get inventory summary
const getInventorySummaryController = async (req, res) => {
    try {
        const summary = await inventoryServices.getInventorySummary();
        res.status(200).json({
            isStatus: true,
            msg: 'Inventory summary retrieved successfully',
            data: summary,
        });
    } catch (error) {
        res.status(500).json({
            isStatus: false,
            msg: error.message || 'Internal Server Error',
            data: null,
        });
    }
};

// Get low stock products
const getLowStockProductsController = async (req, res) => {
    try {
        const threshold = parseInt(req.query.threshold) || 5;
        const products = await inventoryServices.getLowStockProducts(threshold);
        res.status(200).json({
            isStatus: true,
            results: products.length,
            msg: 'Low stock products retrieved successfully',
            data: products,
        });
    } catch (error) {
        res.status(500).json({
            isStatus: false,
            msg: error.message || 'Internal Server Error',
            data: null,
        });
    }
};

// Get out of stock products
const getOutOfStockProductsController = async (req, res) => {
    try {
        const products = await inventoryServices.getOutOfStockProducts();
        res.status(200).json({
            isStatus: true,
            results: products.length,
            msg: 'Out of stock products retrieved successfully',
            data: products,
        });
    } catch (error) {
        res.status(500).json({
            isStatus: false,
            msg: error.message || 'Internal Server Error',
            data: null,
        });
    }
};

// Restock product
const restockProductController = async (req, res) => {
    try {
        const { productId } = req.params;
        const { quantity, reason } = req.body;

        if (!quantity || quantity <= 0) {
            return res.status(400).json({
                isStatus: false,
                msg: 'Valid quantity is required',
                data: null,
            });
        }

        const product = await inventoryServices.restockProduct(productId, quantity, reason);
        res.status(200).json({
            isStatus: true,
            msg: 'Product restocked successfully',
            data: product,
        });
    } catch (error) {
        res.status(500).json({
            isStatus: false,
            msg: error.message || 'Internal Server Error',
            data: null,
        });
    }
};

// Update product stock manually
const updateProductStockController = async (req, res) => {
    try {
        const { productId } = req.params;
        const { quantity, operation } = req.body;

        if (!quantity || quantity <= 0) {
            return res.status(400).json({
                isStatus: false,
                msg: 'Valid quantity is required',
                data: null,
            });
        }

        if (!['increase', 'decrease'].includes(operation)) {
            return res.status(400).json({
                isStatus: false,
                msg: 'Operation must be "increase" or "decrease"',
                data: null,
            });
        }

        const product = await inventoryServices.updateProductStock(productId, quantity, operation);
        res.status(200).json({
            isStatus: true,
            msg: 'Product stock updated successfully',
            data: product,
        });
    } catch (error) {
        if (error.message.includes('Insufficient stock')) {
            return res.status(400).json({
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

module.exports = {
    getInventorySummaryController,
    getLowStockProductsController,
    getOutOfStockProductsController,
    restockProductController,
    updateProductStockController,
};