// services/notificationService.js
const db = require('../config/database');

class NotificationService {
    async createNotification(userId, type, title, message, data = {}) {
        try {
            // First check if notifications table exists
            const tableCheck = await db.query(`
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_name = 'notifications'
                );
            `);
            
            if (!tableCheck.rows[0].exists) {
                console.log('Notifications table does not exist, skipping notification creation');
                return null;
            }

            const query = `
                INSERT INTO notifications (
                    user_id,
                    type,
                    title,
                    message,
                    data,
                    is_read,
                    created_at
                ) VALUES ($1, $2, $3, $4, $5, false, NOW())
                RETURNING *
            `;

            const result = await db.query(query, [userId, type, title, message, JSON.stringify(data)]);
            return result.rows[0];
        } catch (error) {
            console.error('Error creating notification:', error);
            return null;
        }
    }

    async getUserNotifications(userId, limit = 20, unreadOnly = false) {
        try {
            // Check if table exists
            const tableCheck = await db.query(`
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_name = 'notifications'
                );
            `);
            
            if (!tableCheck.rows[0].exists) {
                return [];
            }

            let query = `
                SELECT * FROM notifications
                WHERE user_id = $1
            `;
            
            if (unreadOnly) {
                query += ` AND is_read = false`;
            }
            
            query += ` ORDER BY created_at DESC LIMIT $2`;

            const result = await db.query(query, [userId, limit]);
            return result.rows;
        } catch (error) {
            console.error('Error fetching notifications:', error);
            return [];
        }
    }

    async markAsRead(notificationId, userId) {
        try {
            const tableCheck = await db.query(`
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_name = 'notifications'
                );
            `);
            
            if (!tableCheck.rows[0].exists) {
                return null;
            }

            const query = `
                UPDATE notifications
                SET is_read = true, read_at = NOW()
                WHERE id = $1 AND user_id = $2
                RETURNING *
            `;
            const result = await db.query(query, [notificationId, userId]);
            return result.rows[0];
        } catch (error) {
            console.error('Error marking notification as read:', error);
            return null;
        }
    }

    async markAllAsRead(userId) {
        try {
            const tableCheck = await db.query(`
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_name = 'notifications'
                );
            `);
            
            if (!tableCheck.rows[0].exists) {
                return [];
            }

            const query = `
                UPDATE notifications
                SET is_read = true, read_at = NOW()
                WHERE user_id = $1 AND is_read = false
                RETURNING *
            `;
            const result = await db.query(query, [userId]);
            return result.rows;
        } catch (error) {
            console.error('Error marking all as read:', error);
            return [];
        }
    }

    async deleteNotification(notificationId, userId) {
        try {
            const tableCheck = await db.query(`
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_name = 'notifications'
                );
            `);
            
            if (!tableCheck.rows[0].exists) {
                return null;
            }

            const query = `
                DELETE FROM notifications
                WHERE id = $1 AND user_id = $2
                RETURNING *
            `;
            const result = await db.query(query, [notificationId, userId]);
            return result.rows[0];
        } catch (error) {
            console.error('Error deleting notification:', error);
            return null;
        }
    }

    async getUnreadCount(userId) {
        try {
            // Check if table exists
            const tableCheck = await db.query(`
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_name = 'notifications'
                );
            `);
            
            if (!tableCheck.rows[0].exists) {
                return 0;
            }

            const query = `
                SELECT COUNT(*) as count
                FROM notifications
                WHERE user_id = $1 AND is_read = false
            `;
            const result = await db.query(query, [userId]);
            return parseInt(result.rows[0].count);
        } catch (error) {
            console.error('Error getting unread count:', error);
            return 0;
        }
    }

    // Check for expiring tickets and create notifications
    async checkExpiringTickets() {
        try {
            // Check if notifications table exists
            const tableCheck = await db.query(`
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_name = 'notifications'
                );
            `);
            
            if (!tableCheck.rows[0].exists) {
                console.log('Notifications table does not exist, skipping expiring tickets check');
                return 0;
            }

            // Find tickets expiring in next 3 days
            const query = `
                SELECT t.*, u.email, u.id as user_id
                FROM tickets t
                JOIN users u ON t.user_id = u.id
                WHERE t.status = 'active'
                  AND t.expires_at BETWEEN NOW() AND NOW() + INTERVAL '3 days'
                  AND NOT EXISTS (
                      SELECT 1 FROM notifications n
                      WHERE n.user_id = u.id
                        AND n.type = 'expiring_soon'
                        AND (n.data->>'ticket_id')::int = t.id
                        AND n.created_at > NOW() - INTERVAL '1 day'
                  )
            `;

            const result = await db.query(query);
            
            for (const ticket of result.rows) {
                const daysLeft = Math.ceil((new Date(ticket.expires_at) - new Date()) / (1000 * 60 * 60 * 24));
                
                await this.createNotification(
                    ticket.user_id,
                    'expiring_soon',
                    `🎟️ Ticket Expiring Soon`,
                    `Your ticket for ${ticket.site_name} expires in ${daysLeft} ${daysLeft === 1 ? 'day' : 'days'}. Don't forget to visit!`,
                    {
                        ticket_id: ticket.id,
                        ticket_number: ticket.ticket_number,
                        site_name: ticket.site_name,
                        expires_at: ticket.expires_at,
                        days_left: daysLeft
                    }
                );
            }

            return result.rows.length;
        } catch (error) {
            console.error('Error checking expiring tickets:', error);
            return 0;
        }
    }

    // Check for newly expired tickets
    async checkExpiredTickets() {
        try {
            const query = `
                UPDATE tickets
                SET status = 'expired', updated_at = NOW()
                WHERE status = 'active' AND expires_at < NOW()
                RETURNING *
            `;

            const result = await db.query(query);
            
            // Check if notifications table exists before creating notifications
            const tableCheck = await db.query(`
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_name = 'notifications'
                );
            `);
            
            if (tableCheck.rows[0].exists) {
                for (const ticket of result.rows) {
                    await this.createNotification(
                        ticket.user_id,
                        'expired',
                        `⏰ Ticket Expired`,
                        `Your ticket for ${ticket.site_name} has expired. Book a new visit!`,
                        {
                            ticket_id: ticket.id,
                            ticket_number: ticket.ticket_number,
                            site_name: ticket.site_name,
                            expired_at: new Date()
                        }
                    );
                }
            }

            return result.rows.length;
        } catch (error) {
            console.error('Error checking expired tickets:', error);
            return 0;
        }
    }

    // Create notification for used ticket
    async createUsedTicketNotification(ticketId) {
        try {
            // Check if notifications table exists
            const tableCheck = await db.query(`
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_name = 'notifications'
                );
            `);
            
            if (!tableCheck.rows[0].exists) {
                return null;
            }

            const query = `
                SELECT t.*, u.id as user_id
                FROM tickets t
                JOIN users u ON t.user_id = u.id
                WHERE t.id = $1
            `;

            const result = await db.query(query, [ticketId]);
            const ticket = result.rows[0];

            if (ticket) {
                await this.createNotification(
                    ticket.user_id,
                    'ticket_used',
                    `✅ Ticket Used`,
                    `Thank you for visiting ${ticket.site_name}! We hope you enjoyed your experience.`,
                    {
                        ticket_id: ticket.id,
                        ticket_number: ticket.ticket_number,
                        site_name: ticket.site_name,
                        used_at: new Date()
                    }
                );
            }
        } catch (error) {
            console.error('Error creating used ticket notification:', error);
        }
    }
}

module.exports = new NotificationService();