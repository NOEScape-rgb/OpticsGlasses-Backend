const Product = require('../models/Product');

// Update product stock after order
const updateProductStock = async (productId, quantity, operation = 'decrease') => {
    try {
        const product = await Product.findById(productId);
        if (!product) {
            throw new Error('Product not found');
        }

        let newStock;
        if (operation === 'decrease') {
            newStock = product.stock - quantity;
            if (newStock < 0) {
                throw new Error(`Insufficient stock for product: ${product.name}`);
            }
        } else if (operation === 'increase') {
            newStock = product.stock + quantity;
        } else {
            throw new Error('Invalid operation. Use "increase" or "decrease"');
        }

        // Update stock and status
        let newStatus = product.status;
        if (newStock === 0) {
            newStatus = 'Out of Stock';
        } else if (newStock <= 5) {
            newStatus = 'Low Stock';
        } else if (product.status === 'Out of Stock' || product.status === 'Low Stock') {
            newStatus = 'Active';
        }

        const updatedProduct = await Product.findByIdAndUpdate(
            productId,
            { 
                stock: newStock,
                status: newStatus,
            },
            { new: true }
        );

        return updatedProduct;
    } catch (error) {
        throw new Error(`Stock update failed: ${error.message}`);
    }
};

// Bulk update stock for multiple products (for order processing)
const updateMultipleProductStock = async (items, operation = 'decrease') => {
    try {
        const updatePromises = items.map(item => 
            updateProductStock(item.product || item.productId, item.quantity, operation)
        );

        const results = await Promise.all(updatePromises);
        return results;
    } catch (error) {
        throw new Error(`Bulk stock update failed: ${error.message}`);
    }
};

// Get low stock products
const getLowStockProducts = async (threshold = 5) => {
    try {
        const lowStockProducts = await Product.find({
            stock: { $lte: threshold },
            status: { $ne: 'Draft' }
        }).sort({ stock: 1 });

        return lowStockProducts;
    } catch (error) {
        throw new Error(`Failed to get low stock products: ${error.message}`);
    }
};

// Get out of stock products
const getOutOfStockProducts = async () => {
    try {
        const outOfStockProducts = await Product.find({
            stock: 0,
            status: 'Out of Stock'
        });

        return outOfStockProducts;
    } catch (error) {
        throw new Error(`Failed to get out of stock products: ${error.message}`);
    }
};

// Restock product
const restockProduct = async (productId, quantity, reason = 'Manual restock') => {
    try {
        const updatedProduct = await updateProductStock(productId, quantity, 'increase');
        
        // Log restock activity (you can create an inventory log model later)
        console.log(`Product ${productId} restocked: +${quantity} units. Reason: ${reason}`);
        
        return updatedProduct;
    } catch (error) {
        throw new Error(`Restock failed: ${error.message}`);
    }
};

// Get inventory summary
const getInventorySummary = async () => {
    try {
        const totalProducts = await Product.countDocuments({ status: { $ne: 'Draft' } });
        const activeProducts = await Product.countDocuments({ status: 'Active' });
        const lowStockProducts = await Product.countDocuments({ 
            stock: { $lte: 5 }, 
            status: { $ne: 'Draft' } 
        });
        const outOfStockProducts = await Product.countDocuments({ status: 'Out of Stock' });
        
        const totalStockValue = await Product.aggregate([
            { $match: { status: { $ne: 'Draft' } } },
            { $group: { _id: null, totalValue: { $sum: { $multiply: ['$stock', '$price'] } } } }
        ]);

        return {
            totalProducts,
            activeProducts,
            lowStockProducts,
            outOfStockProducts,
            totalStockValue: totalStockValue[0]?.totalValue || 0,
        };
    } catch (error) {
        throw new Error(`Failed to get inventory summary: ${error.message}`);
    }
};

module.exports = {
    updateProductStock,
    updateMultipleProductStock,
    getLowStockProducts,
    getOutOfStockProducts,
    restockProduct,
    getInventorySummary,
};