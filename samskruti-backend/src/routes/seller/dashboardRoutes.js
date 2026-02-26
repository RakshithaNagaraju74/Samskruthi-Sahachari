// routes/seller/dashboardRoutes.js
const express = require('express');
const router = express.Router();
const Seller = require('../../models/Seller');
const { authMiddleware, sellerMiddleware } = require('../../middlewares/authMiddleware');

// Get seller stats
router.get('/stats', authMiddleware, sellerMiddleware, async (req, res) => {
    try {
        const seller = await Seller.findByUserId(req.user.id);
        const stats = await Seller.getStats(seller.id);
        
        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Error fetching seller stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch stats'
        });
    }
});

// Add product
router.post('/products', authMiddleware, sellerMiddleware, async (req, res) => {
    try {
        const seller = await Seller.findByUserId(req.user.id);
        const product = await Seller.addProduct(seller.id, req.body);
        
        res.json({
            success: true,
            message: 'Product added successfully',
            data: product
        });
    } catch (error) {
        console.error('Error adding product:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add product'
        });
    }
});

// Update product price
router.post('/products/:productId/price', authMiddleware, sellerMiddleware, async (req, res) => {
    try {
        const { productId } = req.params;
        const { newPrice, reason } = req.body;
        
        const seller = await Seller.findByUserId(req.user.id);
        await Seller.updateProductPrice(productId, seller.id, newPrice, reason);
        
        res.json({
            success: true,
            message: 'Price updated successfully'
        });
    } catch (error) {
        console.error('Error updating price:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to update price'
        });
    }
});

module.exports = router;