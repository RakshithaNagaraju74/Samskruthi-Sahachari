const db = require('../config/database');
const crypto = require('crypto');

class Seller {
    // Generate unique seller ID
    static generateSellerId() {
        const prefix = 'SEL';
        const timestamp = Date.now().toString(36).toUpperCase();
        const random = crypto.randomBytes(4).toString('HEX').toUpperCase();
        return `${prefix}${timestamp}${random}`;
    }

    // Create a new seller
    static async create(sellerData) {
        const client = await db.pool.connect();
        try {
            await client.query('BEGIN');

            const {
                email,
                password,
                shop_name,
                owner_name,
                shop_type,
                phone,
                alternate_phone,
                shop_address,
                city,
                state,
                pincode,
                established_year,
                business_description,
                product_categories,
                gst_number,
                pan_number,
                bank_account_number,
                bank_ifsc_code,
                bank_name,
                documents
            } = sellerData;

            // Generate unique seller ID
            const sellerId = this.generateSellerId();

            // Hash password
            const bcrypt = require('bcryptjs');
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            const query = `
                INSERT INTO sellers (
                    seller_id,
                    email,
                    password,
                    shop_name,
                    owner_name,
                    shop_type,
                    phone,
                    alternate_phone,
                    shop_address,
                    city,
                    state,
                    pincode,
                    established_year,
                    business_description,
                    product_categories,
                    gst_number,
                    pan_number,
                    bank_account_number,
                    bank_ifsc_code,
                    bank_name,
                    documents,
                    verification_status,
                    created_at,
                    updated_at
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, NOW(), NOW())
                RETURNING id, seller_id, email, shop_name, verification_status, created_at
            `;

            const values = [
                sellerId,
                email,
                hashedPassword,
                shop_name,
                owner_name,
                shop_type || null,
                phone,
                alternate_phone || null,
                shop_address,
                city || null,
                state || null,
                pincode || null,
                established_year || null,
                business_description || null,
                product_categories || [],
                gst_number || null,
                pan_number || null,
                bank_account_number || null,
                bank_ifsc_code || null,
                bank_name || null,
                JSON.stringify(documents || {}),
                'pending'
            ];

            const result = await client.query(query, values);
            await client.query('COMMIT');
            
            return result.rows[0];
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Error creating seller:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    // Find seller by email
    static async findByEmail(email) {
        try {
            const query = 'SELECT * FROM sellers WHERE email = $1';
            const result = await db.query(query, [email]);
            return result.rows[0];
        } catch (error) {
            console.error('Error finding seller by email:', error);
            throw error;
        }
    }

    // Find seller by ID
    static async findById(id) {
        try {
            const query = 'SELECT * FROM sellers WHERE id = $1';
            const result = await db.query(query, [id]);
            return result.rows[0];
        } catch (error) {
            console.error('Error finding seller by ID:', error);
            throw error;
        }
    }

    // Find seller by seller_id
    static async findBySellerId(sellerId) {
        try {
            const query = 'SELECT * FROM sellers WHERE seller_id = $1';
            const result = await db.query(query, [sellerId]);
            return result.rows[0];
        } catch (error) {
            console.error('Error finding seller by seller_id:', error);
            throw error;
        }
    }

    // Get all pending sellers
    static async getPending() {
        try {
            const query = `
                SELECT id, seller_id, email, shop_name, owner_name, phone,
                       shop_type, city, verification_status, created_at
                FROM sellers 
                WHERE verification_status = 'pending'
                ORDER BY created_at ASC
            `;
            const result = await db.query(query);
            return result.rows;
        } catch (error) {
            console.error('Error getting pending sellers:', error);
            throw error;
        }
    }

    // Get all verified sellers
    static async getVerified() {
        try {
            const query = `
                SELECT id, seller_id, shop_name, owner_name, shop_type,
                       city, state, business_description, rating, total_reviews
                FROM sellers 
                WHERE verification_status = 'approved' AND status = 'active'
                ORDER BY rating DESC NULLS LAST
            `;
            const result = await db.query(query);
            return result.rows;
        } catch (error) {
            console.error('Error getting verified sellers:', error);
            throw error;
        }
    }

    // Update seller verification status
    static async updateVerification(id, status, adminId = null, rejectionReason = null) {
        try {
            const query = `
                UPDATE sellers 
                SET verification_status = $1,
                    verified_at = CASE WHEN $1 = 'approved' THEN NOW() ELSE NULL END,
                    verified_by = $2,
                    rejection_reason = $3,
                    updated_at = NOW()
                WHERE id = $4
                RETURNING id, seller_id, email, shop_name, verification_status
            `;
            const result = await db.query(query, [status, adminId, rejectionReason, id]);
            return result.rows[0];
        } catch (error) {
            console.error('Error updating seller verification:', error);
            throw error;
        }
    }

    // Update seller profile
    static async update(id, updateData) {
        try {
            const allowedFields = [
                'shop_name', 'owner_name', 'shop_type', 'phone', 'alternate_phone',
                'shop_address', 'city', 'state', 'pincode', 'established_year',
                'business_description', 'product_categories', 'gst_number', 'pan_number',
                'bank_account_number', 'bank_ifsc_code', 'bank_name', 'logo_url'
            ];

            const updates = [];
            const values = [];
            let paramIndex = 1;

            Object.keys(updateData).forEach(key => {
                if (allowedFields.includes(key) && updateData[key] !== undefined) {
                    updates.push(`${key} = $${paramIndex}`);
                    values.push(updateData[key]);
                    paramIndex++;
                }
            });

            if (updates.length === 0) {
                return null;
            }

            values.push(id);
            const query = `
                UPDATE sellers 
                SET ${updates.join(', ')}, updated_at = NOW()
                WHERE id = $${paramIndex}
                RETURNING *
            `;

            const result = await db.query(query, values);
            return result.rows[0];
        } catch (error) {
            console.error('Error updating seller:', error);
            throw error;
        }
    }

    // Login seller
    static async login(email, password) {
        try {
            const seller = await this.findByEmail(email);
            if (!seller) return null;

            const bcrypt = require('bcryptjs');
            const isValid = await bcrypt.compare(password, seller.password);
            
            if (!isValid) return null;

            // Don't return password
            delete seller.password;
            return seller;
        } catch (error) {
            console.error('Error logging in seller:', error);
            throw error;
        }
    }

    // Get seller statistics
    static async getStats(sellerId) {
        try {
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
            return result.rows[0] || {
                total_products: 0,
                total_orders: 0,
                total_revenue: 0,
                average_rating: 0,
                orders_last_30_days: 0,
                revenue_last_30_days: 0
            };
        } catch (error) {
            console.error('Error getting seller stats:', error);
            throw error;
        }
    }

    // Get seller products
    static async getProducts(sellerId) {
        try {
            const query = `
                SELECT p.*, 
                       COUNT(DISTINCT o.id) as total_orders,
                       COALESCE(AVG(r.rating), 0) as average_rating
                FROM products p
                LEFT JOIN orders o ON p.id = o.product_id
                LEFT JOIN reviews r ON p.id = r.product_id
                WHERE p.seller_id = $1
                GROUP BY p.id
                ORDER BY p.created_at DESC
            `;
            const result = await db.query(query, [sellerId]);
            return result.rows;
        } catch (error) {
            console.error('Error getting seller products:', error);
            throw error;
        }
    }

    // Add product
    static async addProduct(sellerId, productData) {
        try {
            const {
                name,
                description,
                category,
                subcategory,
                price,
                discount_price,
                stock_quantity,
                unit,
                images,
                tags,
                specifications
            } = productData;

            const query = `
                INSERT INTO products (
                    seller_id,
                    name,
                    description,
                    category,
                    subcategory,
                    price,
                    discount_price,
                    stock_quantity,
                    unit,
                    images,
                    tags,
                    specifications,
                    is_active,
                    created_at,
                    updated_at
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW())
                RETURNING *
            `;

            const values = [
                sellerId,
                name,
                description || null,
                category || null,
                subcategory || null,
                price,
                discount_price || null,
                stock_quantity || 0,
                unit || 'piece',
                images || [],
                tags || [],
                JSON.stringify(specifications || {}),
                true
            ];

            const result = await db.query(query, values);
            
            // Update seller's total products count
            await db.query(
                'UPDATE sellers SET total_products = total_products + 1 WHERE id = $1',
                [sellerId]
            );

            return result.rows[0];
        } catch (error) {
            console.error('Error adding product:', error);
            throw error;
        }
    }

    // Update product
    static async updateProduct(sellerId, productId, productData) {
        try {
            // First verify product belongs to seller
            const checkQuery = 'SELECT id FROM products WHERE id = $1 AND seller_id = $2';
            const checkResult = await db.query(checkQuery, [productId, sellerId]);
            
            if (checkResult.rows.length === 0) {
                throw new Error('Product not found or not owned by this seller');
            }

            const allowedFields = [
                'name', 'description', 'category', 'subcategory', 'price',
                'discount_price', 'stock_quantity', 'unit', 'images', 'tags',
                'specifications', 'is_active'
            ];

            const updates = [];
            const values = [];
            let paramIndex = 1;

            Object.keys(productData).forEach(key => {
                if (allowedFields.includes(key) && productData[key] !== undefined) {
                    updates.push(`${key} = $${paramIndex}`);
                    values.push(productData[key]);
                    paramIndex++;
                }
            });

            if (updates.length === 0) {
                return null;
            }

            values.push(productId);
            const query = `
                UPDATE products 
                SET ${updates.join(', ')}, updated_at = NOW()
                WHERE id = $${paramIndex}
                RETURNING *
            `;

            const result = await db.query(query, values);
            return result.rows[0];
        } catch (error) {
            console.error('Error updating product:', error);
            throw error;
        }
    }

    // Delete product (soft delete)
    static async deleteProduct(sellerId, productId) {
        try {
            const query = `
                UPDATE products 
                SET is_active = false, updated_at = NOW()
                WHERE id = $1 AND seller_id = $2
                RETURNING id
            `;
            const result = await db.query(query, [productId, sellerId]);
            
            if (result.rows.length > 0) {
                // Update seller's total products count
                await db.query(
                    'UPDATE sellers SET total_products = total_products - 1 WHERE id = $1',
                    [sellerId]
                );
            }
            
            return result.rows[0];
        } catch (error) {
            console.error('Error deleting product:', error);
            throw error;
        }
    }

    // Get seller orders
    static async getOrders(sellerId) {
        try {
            const query = `
                SELECT o.*, p.name as product_name, p.images as product_images
                FROM orders o
                JOIN products p ON o.product_id = p.id
                WHERE p.seller_id = $1
                ORDER BY o.created_at DESC
            `;
            const result = await db.query(query, [sellerId]);
            return result.rows;
        } catch (error) {
            console.error('Error getting seller orders:', error);
            throw error;
        }
    }

    // Update order status
    static async updateOrderStatus(sellerId, orderId, status) {
        try {
            const query = `
                UPDATE orders o
                SET order_status = $1, updated_at = NOW()
                FROM products p
                WHERE o.id = $2 AND p.id = o.product_id AND p.seller_id = $3
                RETURNING o.*
            `;
            const result = await db.query(query, [status, orderId, sellerId]);
            return result.rows[0];
        } catch (error) {
            console.error('Error updating order status:', error);
            throw error;
        }
    }
}

module.exports = Seller;