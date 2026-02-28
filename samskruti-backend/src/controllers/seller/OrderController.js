const OrderModel = require('../../models/seller/OrderModel');
const db = require('../../config/database');

class OrderController {
    // Get all orders
    static async getOrders(req, res) {
        try {
            const sellerId = req.sellerId;
            // Add search to destructuring
            const { page, limit, status, payment_status, start_date, end_date, search } = req.query;
            
            const result = await OrderModel.findAll(sellerId, {
                page: parseInt(page) || 1,
                limit: parseInt(limit) || 10,
                status,
                payment_status,
                start_date,
                end_date,
                search  // Add this
            });

            res.json({
                success: true,
                data: result.orders,
                pagination: result.pagination
            });
        } catch (error) {
            console.error('Get orders error:', error);
            res.status(500).json({ 
                success: false,
                message: 'Failed to load orders' 
            });
        }
    }

    // Get single order
    static async getOrder(req, res) {
        try {
            const sellerId = req.sellerId;
            const orderId = req.params.id;

            const order = await OrderModel.findById(orderId, sellerId);

            if (!order) {
                return res.status(404).json({ 
                    success: false,
                    message: 'Order not found' 
                });
            }

            res.json({
                success: true,
                data: order
            });
        } catch (error) {
            console.error('Get order error:', error);
            res.status(500).json({ 
                success: false,
                message: 'Failed to load order' 
            });
        }
    }

    // Update order status
    static async updateOrderStatus(req, res) {
        try {
            const sellerId = req.sellerId;
            const orderId = req.params.id;
            const { order_status, tracking_number, shipping_provider, notes } = req.body;

            const order = await OrderModel.updateStatus(orderId, sellerId, {
                order_status,
                tracking_number,
                shipping_provider,
                notes
            });

            if (!order) {
                return res.status(404).json({ 
                    success: false,
                    message: 'Order not found' 
                });
            }

            // Create notification (with error handling)
            try {
                await db.query(
                    `INSERT INTO seller_notifications 
                     (seller_id, type, title, message, reference_id, reference_type)
                     VALUES ($1, 'order', 'Order Status Updated', 
                             'Order #${order.order_id} status changed to ${order_status}', 
                             $2, 'order')`,
                    [sellerId, orderId]
                );
            } catch (notifError) {
                console.log('Notification not sent - table may not exist:', notifError.message);
                // Continue even if notification fails
            }

            res.json({
                success: true,
                message: 'Order status updated successfully',
                data: order
            });
        } catch (error) {
            console.error('Update order status error:', error);
            res.status(500).json({ 
                success: false,
                message: 'Failed to update order status' 
            });
        }
    }

    // Get order statistics
    static async getOrderStats(req, res) {
        try {
            const sellerId = req.sellerId;
            const stats = await OrderModel.getStats(sellerId);

            // Get recent activity (with error handling)
            let recentActivity = { rows: [] };
            try {
                recentActivity = await db.query(
                    `SELECT 'order' as type, order_id as reference, order_status as status, 
                            created_at, total_amount 
                     FROM seller_orders 
                     WHERE seller_id = $1 
                     ORDER BY created_at DESC 
                     LIMIT 10`,
                    [sellerId]
                );
            } catch (activityError) {
                console.log('Recent activity not available:', activityError.message);
            }

            res.json({
                success: true,
                data: {
                    ...stats,
                    recent_activity: recentActivity.rows
                }
            });
        } catch (error) {
            console.error('Get order stats error:', error);
            res.status(500).json({ 
                success: false,
                message: 'Failed to load order statistics' 
            });
        }
    }
}

module.exports = OrderController;