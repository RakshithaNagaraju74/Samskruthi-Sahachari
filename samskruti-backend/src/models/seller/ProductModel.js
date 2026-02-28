const db = require('../../config/database');

class ProductModel {
    // Create product - MINIMAL VERSION
    static async create(sellerId, productData, images) {
        const {
            name, description, short_description, category,
            price, compare_at_price, sku, quantity, status
        } = productData;

        // Generate slug from name
        const slug = name.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');

        // Process images
        const imagePaths = images || [];
        const thumbnail = imagePaths.length > 0 ? imagePaths[0] : null;

        const result = await db.query(
            `INSERT INTO products (
                seller_id, name, slug, description, short_description,
                category, price, compare_at_price, sku, quantity,
                images, thumbnail, status
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            RETURNING *`,
            [
                sellerId, 
                name, 
                slug, 
                description || '', 
                short_description || '',
                category || null, 
                parseFloat(price), 
                compare_at_price ? parseFloat(compare_at_price) : null,
                sku || null, 
                parseInt(quantity), 
                imagePaths, 
                thumbnail, 
                status || 'draft'
            ]
        );

        // Update seller's total products count
        await db.query(
            'UPDATE sellers SET total_products = total_products + 1 WHERE id = $1',
            [sellerId]
        );

        return result.rows[0];
    }

    // Get all products for a seller
    static async findAll(sellerId, filters = {}) {
        const { page = 1, limit = 10, status, search } = filters;
        const offset = (page - 1) * limit;

        let query = 'SELECT * FROM products WHERE seller_id = $1';
        const params = [sellerId];
        let paramIndex = 2;

        if (status) {
            query += ` AND status = $${paramIndex}`;
            params.push(status);
            paramIndex++;
        }

        if (search) {
            query += ` AND (name ILIKE $${paramIndex} OR description ILIKE $${paramIndex} OR sku ILIKE $${paramIndex})`;
            params.push(`%${search}%`);
            paramIndex++;
        }

        query += ' ORDER BY created_at DESC LIMIT $' + paramIndex + ' OFFSET $' + (paramIndex + 1);
        params.push(limit, offset);

        const products = await db.query(query, params);

        // Get total count
        let countQuery = 'SELECT COUNT(*) FROM products WHERE seller_id = $1';
        const countParams = [sellerId];
        
        if (status) {
            countQuery += ' AND status = $2';
            countParams.push(status);
        }
        
        if (search) {
            countQuery += ' AND (name ILIKE $3 OR description ILIKE $3 OR sku ILIKE $3)';
            countParams.push(`%${search}%`);
        }

        const total = await db.query(countQuery, countParams);

        return {
            products: products.rows,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: parseInt(total.rows[0].count),
                pages: Math.ceil(total.rows[0].count / limit)
            }
        };
    }

    // Get single product
    static async findById(productId, sellerId) {
        const result = await db.query(
            'SELECT * FROM products WHERE id = $1 AND seller_id = $2',
            [productId, sellerId]
        );
        return result.rows[0];
    }

    // Update product - MINIMAL VERSION
    static async update(productId, sellerId, productData, images) {
        const {
            name, description, short_description, category,
            price, compare_at_price, sku, quantity, status,
            existing_images
        } = productData;

        // Process images
        let imagePaths = existing_images ? 
            (Array.isArray(existing_images) ? existing_images : JSON.parse(existing_images)) : [];
            
        if (images && images.length > 0) {
            imagePaths = [...imagePaths, ...images];
        }

        const thumbnail = imagePaths.length > 0 ? imagePaths[0] : null;

        const result = await db.query(
            `UPDATE products 
             SET name = COALESCE($1, name),
                 description = COALESCE($2, description),
                 short_description = COALESCE($3, short_description),
                 category = COALESCE($4, category),
                 price = COALESCE($5, price),
                 compare_at_price = COALESCE($6, compare_at_price),
                 sku = COALESCE($7, sku),
                 quantity = COALESCE($8, quantity),
                 images = $9,
                 thumbnail = $10,
                 status = COALESCE($11, status),
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $12 AND seller_id = $13
             RETURNING *`,
            [
                name, 
                description, 
                short_description, 
                category,
                price ? parseFloat(price) : null,
                compare_at_price ? parseFloat(compare_at_price) : null,
                sku, 
                quantity ? parseInt(quantity) : null,
                imagePaths, 
                thumbnail, 
                status,
                productId, 
                sellerId
            ]
        );

        return result.rows[0];
    }

    // Delete product
    static async delete(productId, sellerId) {
        const result = await db.query(
            'DELETE FROM products WHERE id = $1 AND seller_id = $2 RETURNING id',
            [productId, sellerId]
        );

        if (result.rows.length > 0) {
            await db.query(
                'UPDATE sellers SET total_products = total_products - 1 WHERE id = $1',
                [sellerId]
            );
        }

        return result.rows.length > 0;
    }

    // Update product status
    static async updateStatus(productId, sellerId, status) {
        const result = await db.query(
            'UPDATE products SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND seller_id = $3 RETURNING *',
            [status, productId, sellerId]
        );
        return result.rows[0];
    }

    // Update product quantity
    static async updateQuantity(productId, sellerId, quantity, reason = 'manual_update') {
        const product = await db.query(
            'SELECT quantity FROM products WHERE id = $1 AND seller_id = $2',
            [productId, sellerId]
        );

        if (product.rows.length === 0) {
            return null;
        }

        const previousQuantity = product.rows[0].quantity;

        const result = await db.query(
            'UPDATE products SET quantity = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND seller_id = $3 RETURNING *',
            [quantity, productId, sellerId]
        );

        // Log inventory change (if table exists)
        try {
            await db.query(
                `INSERT INTO inventory_logs 
                 (seller_id, product_id, action, quantity_change, previous_quantity, new_quantity, reason)
                 VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [sellerId, productId, 'manual', quantity - previousQuantity, previousQuantity, quantity, reason]
            );
        } catch (err) {
            console.log('Inventory log skipped:', err.message);
        }

        return result.rows[0];
    }

    // Get low stock products
    static async getLowStock(sellerId) {
        const result = await db.query(
            `SELECT * FROM products 
             WHERE seller_id = $1 
                AND quantity <= low_stock_threshold 
                AND quantity > 0
                AND status = 'published'
             ORDER BY quantity ASC`,
            [sellerId]
        );
        return result.rows;
    }
}

module.exports = ProductModel;