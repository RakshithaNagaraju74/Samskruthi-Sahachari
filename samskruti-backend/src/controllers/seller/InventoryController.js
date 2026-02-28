const db = require('../../config/database');

class InventoryController {
  static async getLogs(req, res) {
    try {
      const sellerId = req.sellerId;
      const { page = 1, limit = 20 } = req.query;
      const offset = (page - 1) * limit;

      const logs = await db.query(
        `SELECT l.*, p.name as product_name, p.thumbnail
         FROM inventory_logs l
         JOIN products p ON l.product_id = p.id
         WHERE l.seller_id = $1
         ORDER BY l.created_at DESC
         LIMIT $2 OFFSET $3`,
        [sellerId, limit, offset]
      );

      const total = await db.query(
        'SELECT COUNT(*) FROM inventory_logs WHERE seller_id = $1',
        [sellerId]
      );

      res.json({
        success: true,
        data: logs.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: parseInt(total.rows[0].count),
          pages: Math.ceil(total.rows[0].count / limit)
        }
      });
    } catch (error) {
      console.error('Inventory logs error:', error);
      res.status(500).json({ 
        success: false,
        message: 'Failed to fetch inventory logs' 
      });
    }
  }
}

module.exports = InventoryController;