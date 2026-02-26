// routes/notificationRoutes.js
const express = require('express');
const router = express.Router();
const notificationService = require('../services/notificationService');
const { authMiddleware } = require('../middlewares/authMiddleware');

// Get user notifications
router.get('/', authMiddleware, async (req, res) => {
    try {
        const { limit = 20, unreadOnly = false } = req.query;
        const notifications = await notificationService.getUserNotifications(
            req.user.id,
            parseInt(limit),
            unreadOnly === 'true'
        );
        
        const unreadCount = await notificationService.getUnreadCount(req.user.id);
        
        res.json({
            success: true,
            data: notifications,
            unreadCount,
            count: notifications.length
        });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch notifications'
        });
    }
});

// Mark notification as read
router.patch('/:id/read', authMiddleware, async (req, res) => {
    try {
        const notification = await notificationService.markAsRead(req.params.id, req.user.id);
        
        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }

        res.json({
            success: true,
            data: notification
        });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to mark notification as read'
        });
    }
});

// Mark all notifications as read
router.post('/mark-all-read', authMiddleware, async (req, res) => {
    try {
        const notifications = await notificationService.markAllAsRead(req.user.id);
        
        res.json({
            success: true,
            data: notifications,
            count: notifications.length
        });
    } catch (error) {
        console.error('Error marking all as read:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to mark all as read'
        });
    }
});

// Delete notification
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const notification = await notificationService.deleteNotification(req.params.id, req.user.id);
        
        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }

        res.json({
            success: true,
            message: 'Notification deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting notification:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete notification'
        });
    }
});

// Get unread count
router.get('/unread-count', authMiddleware, async (req, res) => {
    try {
        const count = await notificationService.getUnreadCount(req.user.id);
        
        res.json({
            success: true,
            data: { count }
        });
    } catch (error) {
        console.error('Error getting unread count:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get unread count'
        });
    }
});

module.exports = router;