const express = require('express');
const router = express.Router();
const Seller = require('../models/Seller');
const { authenticateSeller } = require('../middlewares/sellerAuth');

// Middleware to authenticate seller
router.use(authenticateSeller);

// Get seller profile
router.get('/profile', async (req, res) => {
    try {
        const seller = await Seller.findById(req.seller.id);
        res.json({
            success: true,
            data: seller
        });
    } catch (error) {
        console.error('Error fetching seller profile:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch profile'
        });
    }
});

// Update seller profile
router.put('/profile', async (req, res) => {
    try {
        const seller = await Seller.update(req.seller.id, req.body);
        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: seller
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update profile'
        });
    }
});

// Get seller statistics
router.get('/stats', async (req, res) => {
    try {
        const stats = await Seller.getStats(req.seller.id);
        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch statistics'
        });
    }
});

// Get seller products
router.get('/products', async (req, res) => {
    try {
        const products = await Seller.getProducts(req.seller.id);
        res.json({
            success: true,
            data: products,
            count: products.length
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch products'
        });
    }
});

// Add new product
router.post('/products', async (req, res) => {
    try {
        const product = await Seller.addProduct(req.seller.id, req.body);
        res.status(201).json({
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

// Update product
router.put('/products/:productId', async (req, res) => {
    try {
        const product = await Seller.updateProduct(req.seller.id, req.params.productId, req.body);
        res.json({
            success: true,
            message: 'Product updated successfully',
            data: product
        });
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to update product'
        });
    }
});

// Delete product
router.delete('/products/:productId', async (req, res) => {
    try {
        await Seller.deleteProduct(req.seller.id, req.params.productId);
        res.json({
            success: true,
            message: 'Product deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete product'
        });
    }
});

// Get seller orders
router.get('/orders', async (req, res) => {
    try {
        const orders = await Seller.getOrders(req.seller.id);
        res.json({
            success: true,
            data: orders,
            count: orders.length
        });
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch orders'
        });
    }
});

// Update order status
router.put('/orders/:orderId/status', async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Seller.updateOrderStatus(req.seller.id, req.params.orderId, status);
        res.json({
            success: true,
            message: 'Order status updated successfully',
            data: order
        });
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update order status'
        });
    }
});

module.exports = router;