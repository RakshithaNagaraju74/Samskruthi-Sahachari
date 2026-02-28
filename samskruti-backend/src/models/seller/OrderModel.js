const db = require('../../config/database');

class OrderModel {
    // Get all orders for a seller
    static async findAll(sellerId, filters = {}) {
        const { page = 1, limit = 10, status, payment_status, start_date, end_date, search } = filters;
        const offset = (page - 1) * limit;

        let query = 'SELECT * FROM seller_orders WHERE seller_id = $1';
        const params = [sellerId];
        let paramIndex = 2;

        if (status) {
            query += ` AND order_status = $${paramIndex}`;
            params.push(status);
            paramIndex++;
        }

        if (payment_status) {
            query += ` AND payment_status = $${paramIndex}`;
            params.push(payment_status);
            paramIndex++;
        }

        if (start_date) {
            query += ` AND created_at >= $${paramIndex}`;
            params.push(start_date);
            paramIndex++;
        }

        if (end_date) {
            query += ` AND created_at <= $${paramIndex}`;
            params.push(end_date);
            paramIndex++;
        }

        // ADD SEARCH FUNCTIONALITY
        if (search) {
            query += ` AND (order_id ILIKE $${paramIndex} 
                          OR customer_name ILIKE $${paramIndex} 
                          OR customer_email ILIKE $${paramIndex}
                          OR customer_phone ILIKE $${paramIndex})`;
            params.push(`%${search}%`);
            paramIndex++;
        }

        query += ' ORDER BY created_at DESC LIMIT $' + paramIndex + ' OFFSET $' + (paramIndex + 1);
        params.push(limit, offset);

        const orders = await db.query(query, params);

        // Get order items for each order
        for (let order of orders.rows) {
            try {
                const items = await db.query(
                    'SELECT * FROM order_items WHERE seller_order_id = $1',
                    [order.id]
                );
                order.items = items.rows;
            } catch (itemError) {
                console.log(`No items found for order ${order.id}`);
                order.items = [];
            }
        }

        // Get total count with same filters
        let countQuery = 'SELECT COUNT(*) FROM seller_orders WHERE seller_id = $1';
        const countParams = [sellerId];
        let countIndex = 2;
        
        if (status) {
            countQuery += ' AND order_status = $' + countIndex;
            countParams.push(status);
            countIndex++;
        }
        
        if (payment_status) {
            countQuery += ' AND payment_status = $' + countIndex;
            countParams.push(payment_status);
            countIndex++;
        }
        
        if (search) {
            countQuery += ` AND (order_id ILIKE $${countIndex} 
                               OR customer_name ILIKE $${countIndex} 
                               OR customer_email ILIKE $${countIndex}
                               OR customer_phone ILIKE $${countIndex})`;
            countParams.push(`%${search}%`);
            countIndex++;
        }

        const total = await db.query(countQuery, countParams);

        return {
            orders: orders.rows,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: parseInt(total.rows[0].count),
                pages: Math.ceil(total.rows[0].count / limit)
            }
        };
    }

    // Get single order
    static async findById(orderId, sellerId) {
        const order = await db.query(
            'SELECT * FROM seller_orders WHERE id = $1 AND seller_id = $2',
            [orderId, sellerId]
        );

        if (order.rows.length === 0) {
            return null;
        }

        // Get order items
        try {
            const items = await db.query(
                'SELECT * FROM order_items WHERE seller_order_id = $1',
                [orderId]
            );
            order.rows[0].items = items.rows;
        } catch (itemError) {
            order.rows[0].items = [];
        }

        return order.rows[0];
    }

    // Update order status
    static async updateStatus(orderId, sellerId, data) {
        const { order_status, tracking_number, shipping_provider, notes } = data;

        const order = await db.query(
            'SELECT * FROM seller_orders WHERE id = $1 AND seller_id = $2',
            [orderId, sellerId]
        );

        if (order.rows.length === 0) {
            return null;
        }

        const result = await db.query(
            `UPDATE seller_orders 
             SET order_status = COALESCE($1, order_status),
                 tracking_number = COALESCE($2, tracking_number),
                 shipping_provider = COALESCE($3, shipping_provider),
                 seller_notes = COALESCE($4, seller_notes),
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $5 AND seller_id = $6
             RETURNING *`,
            [order_status, tracking_number, shipping_provider, notes, orderId, sellerId]
        );

        return result.rows[0];
    }

    // Get order statistics
    static async getStats(sellerId) {
        const result = await db.query(
            `SELECT 
                COUNT(*) as total_orders,
                COUNT(CASE WHEN order_status = 'pending' THEN 1 END) as pending,
                COUNT(CASE WHEN order_status = 'processing' THEN 1 END) as processing,
                COUNT(CASE WHEN order_status = 'confirmed' THEN 1 END) as confirmed,
                COUNT(CASE WHEN order_status = 'shipped' THEN 1 END) as shipped,
                COUNT(CASE WHEN order_status = 'delivered' THEN 1 END) as delivered,
                COUNT(CASE WHEN order_status = 'cancelled' THEN 1 END) as cancelled,
                COUNT(CASE WHEN order_status = 'returned' THEN 1 END) as returned,
                COALESCE(SUM(total_amount), 0) as total_revenue,
                COALESCE(AVG(total_amount), 0) as average_order_value
             FROM seller_orders 
             WHERE seller_id = $1`,
            [sellerId]
        );

        return result.rows[0];
    }
}

module.exports = OrderModel;