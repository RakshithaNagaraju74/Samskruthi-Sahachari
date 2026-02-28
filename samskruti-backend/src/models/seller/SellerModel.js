const db = require('../../config/database');

class SellerModel {
    // Get seller profile with all details
    static async getProfile(sellerId) {
        const result = await db.query(
            `SELECT s.*, u.email, u.created_at as joined_date 
             FROM sellers s 
             JOIN users u ON s.user_id = u.id 
             WHERE s.id = $1`,
            [sellerId]
        );
        return result.rows[0];
    }

    // Update seller profile
  // Update seller profile
    static async updateProfile(sellerId, data) {
        const { 
            shop_name, owner_name, phone, shop_address 
        } = data;
        
        const result = await db.query(
            `UPDATE sellers 
            SET shop_name = COALESCE($1, shop_name),
                owner_name = COALESCE($2, owner_name),
                phone = COALESCE($3, phone),
                shop_address = COALESCE($4, shop_address),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $5
            RETURNING *`,
            [shop_name, owner_name, phone, shop_address, sellerId]
        );
        
        return result.rows[0];
    }

    // Update seller logo
    static async updateLogo(sellerId, logoPath) {
        const result = await db.query(
            `UPDATE sellers SET logo = $1, updated_at = CURRENT_TIMESTAMP 
             WHERE id = $2 RETURNING logo`,
            [logoPath, sellerId]
        );
        return result.rows[0];
    }

    // Update seller banner
    static async updateBanner(sellerId, bannerPath) {
        const result = await db.query(
            `UPDATE sellers SET banner = $1, updated_at = CURRENT_TIMESTAMP 
             WHERE id = $2 RETURNING banner`,
            [bannerPath, sellerId]
        );
        return result.rows[0];
    }

    // Get dashboard statistics
    static async getDashboardStats(sellerId) {
        // Get today's stats
        const today = new Date().toISOString().split('T')[0];
        const todayStats = await db.query(
            `SELECT 
                COUNT(*) as today_orders,
                COALESCE(SUM(total_amount), 0) as today_revenue
             FROM seller_orders 
             WHERE seller_id = $1 AND DATE(created_at) = $2`,
            [sellerId, today]
        );

        // Get total stats
        const totalStats = await db.query(
            `SELECT 
                COUNT(*) as total_orders,
                COALESCE(SUM(total_amount), 0) as total_revenue,
                COUNT(DISTINCT customer_email) as total_customers
             FROM seller_orders 
             WHERE seller_id = $1`,
            [sellerId]
        );

        // Get pending orders
        const pendingOrders = await db.query(
            `SELECT COUNT(*) as pending_orders 
             FROM seller_orders 
             WHERE seller_id = $1 AND order_status IN ('processing', 'confirmed')`,
            [sellerId]
        );

        // Get product stats
        const productStats = await db.query(
            `SELECT 
                COUNT(*) as total_products,
                COUNT(CASE WHEN status = 'published' THEN 1 END) as published_products,
                COUNT(CASE WHEN quantity <= low_stock_threshold AND quantity > 0 THEN 1 END) as low_stock_products,
                COUNT(CASE WHEN quantity = 0 THEN 1 END) as out_of_stock
             FROM products 
             WHERE seller_id = $1`,
            [sellerId]
        );

        // Get recent orders
        const recentOrders = await db.query(
            `SELECT id, order_id, customer_name, total_amount, order_status, created_at 
             FROM seller_orders 
             WHERE seller_id = $1 
             ORDER BY created_at DESC 
             LIMIT 5`,
            [sellerId]
        );

        // Get monthly revenue for chart
        const monthlyRevenue = await db.query(
            `SELECT 
                TO_CHAR(created_at, 'Mon') as month,
                EXTRACT(MONTH FROM created_at) as month_num,
                EXTRACT(YEAR FROM created_at) as year,
                COALESCE(SUM(total_amount), 0) as revenue
             FROM seller_orders 
             WHERE seller_id = $1 
                AND created_at >= DATE_TRUNC('year', CURRENT_DATE)
             GROUP BY month, month_num, year
             ORDER BY month_num`,
            [sellerId]
        );

        return {
            today: {
                orders: parseInt(todayStats.rows[0].today_orders),
                revenue: parseFloat(todayStats.rows[0].today_revenue)
            },
            total: {
                orders: parseInt(totalStats.rows[0].total_orders),
                revenue: parseFloat(totalStats.rows[0].total_revenue),
                customers: parseInt(totalStats.rows[0].total_customers)
            },
            pending_orders: parseInt(pendingOrders.rows[0].pending_orders),
            products: {
                total: parseInt(productStats.rows[0].total_products),
                published: parseInt(productStats.rows[0].published_products),
                low_stock: parseInt(productStats.rows[0].low_stock_products),
                out_of_stock: parseInt(productStats.rows[0].out_of_stock)
            },
            recent_orders: recentOrders.rows,
            monthly_revenue: monthlyRevenue.rows
        };
    }

    // Get seller earnings
    static async getEarnings(sellerId) {
        const result = await db.query(
            `SELECT 
                COALESCE(SUM(total_amount), 0) as total_earnings,
                COALESCE(SUM(commission_amount), 0) as total_commission,
                COALESCE(SUM(net_amount), 0) as net_earnings,
                COALESCE(SUM(CASE WHEN payment_status = 'paid' THEN net_amount ELSE 0 END), 0) as paid_earnings,
                COALESCE(SUM(CASE WHEN payment_status != 'paid' THEN net_amount ELSE 0 END), 0) as pending_earnings
             FROM seller_orders 
             WHERE seller_id = $1`,
            [sellerId]
        );
        return result.rows[0];
    }
}

module.exports = SellerModel;