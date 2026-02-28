const db = require('../../config/database');

class NotificationController {
  static async getNotifications(req, res) {
    try {
      const userId = req.user.id; // ✅ use the user ID, not sellerId
      const { unread_only = 'false' } = req.query;

      let query = `
        SELECT * FROM notifications 
        WHERE user_id = $1
      `;
      const params = [userId];

      if (unread_only === 'true') {
        query += ' AND is_read = false';
      }

      query += ' ORDER BY created_at DESC';

      const result = await db.query(query, params);

      res.json({
        success: true,
        data: result.rows,
        unread_count: result.rows.filter(n => !n.is_read).length
      });
    } catch (error) {
      console.error('Get notifications error:', error);
      if (error.code === '42P01') { // table doesn't exist
        return res.json({
          success: true,
          data: [],
          unread_count: 0,
          message: 'Notifications table not set up yet'
        });
      }
      res.status(500).json({
        success: false,
        message: 'Failed to fetch notifications'
      });
    }
  }

  static async markAsRead(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const result = await db.query(
        'UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2 RETURNING *',
        [id, userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Notification not found'
        });
      }

      res.json({
        success: true,
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Mark notification read error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update notification'
      });
    }
  }
}

module.exports = NotificationController;