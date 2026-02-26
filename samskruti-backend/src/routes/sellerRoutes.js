const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { checkUserType } = require('../middlewares/checkUserType');

// ============================================
// PUBLIC SELLER ROUTES
// ============================================

// Get all verified sellers
router.get('/verified', async (req, res) => {
    try {
        const query = `
            SELECT id, shop_name, owner_name, shop_type, city, state, 
                   rating, total_reviews, business_description
            FROM sellers 
            WHERE verification_status = 'approved' AND status = 'active'
            ORDER BY rating DESC NULLS LAST
        `;
        const result = await db.query(query);
        
        res.json({
            success: true,
            data: result.rows,
            count: result.rows.length
        });
    } catch (error) {
        console.error('Error fetching verified sellers:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch sellers',
            error: error.message
        });
    }
});

// Get seller by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const query = `
            SELECT s.*, u.email
            FROM sellers s
            JOIN users u ON s.user_id = u.id
            WHERE s.id = $1 AND s.verification_status = 'approved'
        `;
        const result = await db.query(query, [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Seller not found'
            });
        }
        
        res.json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error fetching seller:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch seller',
            error: error.message
        });
    }
});

// Get seller's products
router.get('/:id/products', async (req, res) => {
    try {
        const { id } = req.params;
        const query = `
            SELECT * FROM products 
            WHERE seller_id = $1 AND is_active = true
            ORDER BY created_at DESC
        `;
        const result = await db.query(query, [id]);
        
        res.json({
            success: true,
            data: result.rows,
            count: result.rows.length
        });
    } catch (error) {
        console.error('Error fetching seller products:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch products',
            error: error.message
        });
    }
});

// ============================================
// SELLER PROFILE ROUTES (Protected)
// ============================================

// Get current seller profile
router.get('/profile/me', authMiddleware, checkUserType(['seller']), async (req, res) => {
    try {
        const query = 'SELECT * FROM sellers WHERE user_id = $1';
        const result = await db.query(query, [req.user.id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Seller profile not found'
            });
        }
        
        res.json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error fetching seller profile:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch seller profile',
            error: error.message
        });
    }
});

// Get seller's own products
router.get('/my-products', authMiddleware, checkUserType(['seller']), async (req, res) => {
    try {
        const sellerQuery = 'SELECT id FROM sellers WHERE user_id = $1';
        const sellerResult = await db.query(sellerQuery, [req.user.id]);
        
        if (sellerResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Seller profile not found'
            });
        }
        
        const sellerId = sellerResult.rows[0].id;
        
        const query = `
            SELECT * FROM products 
            WHERE seller_id = $1
            ORDER BY created_at DESC
        `;
        const result = await db.query(query, [sellerId]);
        
        res.json({
            success: true,
            data: result.rows,
            count: result.rows.length
        });
    } catch (error) {
        console.error('Error fetching seller products:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch products',
            error: error.message
        });
    }
});

// Create a new product
router.post('/products', authMiddleware, checkUserType(['seller']), async (req, res) => {
    try {
        const sellerQuery = 'SELECT id FROM sellers WHERE user_id = $1';
        const sellerResult = await db.query(sellerQuery, [req.user.id]);
        
        if (sellerResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Seller profile not found'
            });
        }
        
        const sellerId = sellerResult.rows[0].id;
        
        const {
            name, description, category, subcategory, price,
            discount_price, stock_quantity, unit, images, tags,
            specifications
        } = req.body;
        
        const query = `
            INSERT INTO products (
                seller_id, name, description, category, subcategory,
                price, discount_price, stock_quantity, unit, images,
                tags, specifications, is_active, created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, true, NOW(), NOW())
            RETURNING *
        `;
        
        const values = [
            sellerId, name, description, category, subcategory,
            price, discount_price || null, stock_quantity, unit,
            images || [], tags || [], specifications || {}
        ];
        
        const result = await db.query(query, values);
        
        // Update seller's total products count
        await db.query(
            'UPDATE sellers SET total_products = total_products + 1 WHERE id = $1',
            [sellerId]
        );
        
        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create product',
            error: error.message
        });
    }
});

// Update product
router.put('/products/:productId', authMiddleware, checkUserType(['seller']), async (req, res) => {
    try {
        const { productId } = req.params;
        
        const sellerQuery = 'SELECT id FROM sellers WHERE user_id = $1';
        const sellerResult = await db.query(sellerQuery, [req.user.id]);
        
        if (sellerResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Seller profile not found'
            });
        }
        
        const sellerId = sellerResult.rows[0].id;
        
        // Check if product belongs to seller
        const checkQuery = 'SELECT * FROM products WHERE id = $1 AND seller_id = $2';
        const checkResult = await db.query(checkQuery, [productId, sellerId]);
        
        if (checkResult.rows.length === 0) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized to update this product'
            });
        }
        
        const allowedFields = [
            'name', 'description', 'category', 'subcategory', 'price',
            'discount_price', 'stock_quantity', 'unit', 'images', 'tags',
            'specifications', 'is_active'
        ];
        
        const updates = [];
        const values = [];
        let paramIndex = 1;
        
        Object.keys(req.body).forEach(key => {
            if (allowedFields.includes(key) && req.body[key] !== undefined) {
                updates.push(`${key} = $${paramIndex}`);
                values.push(req.body[key]);
                paramIndex++;
            }
        });
        
        if (updates.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No valid fields to update'
            });
        }
        
        values.push(productId);
        const updateQuery = `
            UPDATE products 
            SET ${updates.join(', ')}, updated_at = NOW()
            WHERE id = $${paramIndex}
            RETURNING *
        `;
        
        const result = await db.query(updateQuery, values);
        
        res.json({
            success: true,
            message: 'Product updated successfully',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update product',
            error: error.message
        });
    }
});

// Delete product (soft delete)
router.delete('/products/:productId', authMiddleware, checkUserType(['seller']), async (req, res) => {
    try {
        const { productId } = req.params;
        
        const sellerQuery = 'SELECT id FROM sellers WHERE user_id = $1';
        const sellerResult = await db.query(sellerQuery, [req.user.id]);
        
        if (sellerResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Seller profile not found'
            });
        }
        
        const sellerId = sellerResult.rows[0].id;
        
        // Check if product belongs to seller
        const checkQuery = 'SELECT * FROM products WHERE id = $1 AND seller_id = $2';
        const checkResult = await db.query(checkQuery, [productId, sellerId]);
        
        if (checkResult.rows.length === 0) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized to delete this product'
            });
        }
        
        const query = 'UPDATE products SET is_active = false, updated_at = NOW() WHERE id = $1 RETURNING *';
        const result = await db.query(query, [productId]);
        
        // Update seller's total products count
        await db.query(
            'UPDATE sellers SET total_products = total_products - 1 WHERE id = $1',
            [sellerId]
        );
        
        res.json({
            success: true,
            message: 'Product deleted successfully',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete product',
            error: error.message
        });
    }
});

// Get seller's orders
router.get('/orders', authMiddleware, checkUserType(['seller']), async (req, res) => {
    try {
        const sellerQuery = 'SELECT id FROM sellers WHERE user_id = $1';
        const sellerResult = await db.query(sellerQuery, [req.user.id]);
        
        if (sellerResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Seller profile not found'
            });
        }
        
        const sellerId = sellerResult.rows[0].id;
        
        const query = `
            SELECT o.*, p.name as product_name, p.images as product_images,
                   u.email as customer_email
            FROM orders o
            JOIN products p ON o.product_id = p.id
            JOIN users u ON o.user_id = u.id
            WHERE p.seller_id = $1
            ORDER BY o.created_at DESC
        `;
        
        const result = await db.query(query, [sellerId]);
        
        res.json({
            success: true,
            data: result.rows,
            count: result.rows.length
        });
    } catch (error) {
        console.error('Error fetching seller orders:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch orders',
            error: error.message
        });
    }
});

// Get seller statistics
router.get('/stats', authMiddleware, checkUserType(['seller']), async (req, res) => {
    try {
        const sellerQuery = 'SELECT id FROM sellers WHERE user_id = $1';
        const sellerResult = await db.query(sellerQuery, [req.user.id]);
        
        if (sellerResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Seller profile not found'
            });
        }
        
        const sellerId = sellerResult.rows[0].id;
        
        const query = `
            SELECT 
                COUNT(DISTINCT p.id) as total_products,
                COUNT(DISTINCT o.id) as total_orders,
                COALESCE(SUM(o.total_amount), 0) as total_revenue,
                COALESCE(AVG(r.rating), 0) as average_rating,
                COUNT(DISTINCT CASE WHEN o.created_at >= NOW() - INTERVAL '30 days' THEN o.id END) as orders_last_30_days,
                COALESCE(SUM(CASE WHEN o.created_at >= NOW() - INTERVAL '30 days' THEN o.total_amount ELSE 0 END), 0) as revenue_last_30_days
            FROM sellers s
            LEFT JOIN products p ON s.id = p.seller_id
            LEFT JOIN orders o ON p.id = o.product_id
            LEFT JOIN reviews r ON p.id = r.product_id
            WHERE s.id = $1
            GROUP BY s.id
        `;
        
        const result = await db.query(query, [sellerId]);
        
        res.json({
            success: true,
            data: result.rows[0] || {
                total_products: 0,
                total_orders: 0,
                total_revenue: 0,
                average_rating: 0,
                orders_last_30_days: 0,
                revenue_last_30_days: 0
            }
        });
    } catch (error) {
        console.error('Error fetching seller stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch seller statistics',
            error: error.message
        });
    }
});

module.exports = router;