// models/Message.js
const db = require('../config/database');

class Message {
    // Create a new conversation
    static async createConversation(userId, enterpriseId, siteId, subject) {
        try {
            const query = `
                INSERT INTO conversations (user_id, enterprise_id, site_id, subject, created_at, updated_at)
                VALUES ($1, $2, $3, $4, NOW(), NOW())
                ON CONFLICT (user_id, enterprise_id, site_id) 
                DO UPDATE SET updated_at = NOW(), status = 'active'
                RETURNING *
            `;
            
            const result = await db.query(query, [userId, enterpriseId, siteId, subject]);
            return result.rows[0];
        } catch (error) {
            console.error('Error creating conversation:', error);
            throw error;
        }
    }

    // Get or create conversation
    static async getOrCreateConversation(userId, enterpriseId, siteId, subject = '') {
        try {
            // Check if conversation exists
            let conversation = await this.getConversation(userId, enterpriseId, siteId);
            
            if (!conversation) {
                conversation = await this.createConversation(userId, enterpriseId, siteId, subject);
            }
            
            return conversation;
        } catch (error) {
            console.error('Error getting/creating conversation:', error);
            throw error;
        }
    }

    // Get conversation by ID
    static async getConversationById(conversationId) {
        try {
            const query = `
                SELECT c.*, 
                       u.email as user_email, 
                       u.role as user_role,
                       u.full_name as user_name,
                       u.phone as user_phone,
                       e.enterprise_name,
                       hs.name as site_name, 
                       hs.main_image as site_image
                FROM conversations c
                LEFT JOIN users u ON c.user_id = u.id
                LEFT JOIN enterprises e ON c.enterprise_id = e.id
                LEFT JOIN heritage_sites hs ON c.site_id = hs.id
                WHERE c.id = $1
            `;
            
            const result = await db.query(query, [conversationId]);
            return result.rows[0];
        } catch (error) {
            console.error('Error getting conversation:', error);
            throw error;
        }
    }

    // Get conversation between user and enterprise for a site
    static async getConversation(userId, enterpriseId, siteId) {
        try {
            const query = `
                SELECT c.*, 
                       u.email as user_email,
                       u.full_name as user_name,
                       e.enterprise_name,
                       hs.name as site_name
                FROM conversations c
                LEFT JOIN users u ON c.user_id = u.id
                LEFT JOIN enterprises e ON c.enterprise_id = e.id
                LEFT JOIN heritage_sites hs ON c.site_id = hs.id
                WHERE c.user_id = $1 AND c.enterprise_id = $2 AND c.site_id = $3
            `;
            
            const result = await db.query(query, [userId, enterpriseId, siteId]);
            return result.rows[0];
        } catch (error) {
            console.error('Error getting conversation:', error);
            throw error;
        }
    }

    // Get user's conversations
    static async getUserConversations(userId) {
        try {
            const query = `
                SELECT c.*, 
                       e.enterprise_name, 
                       e.website as enterprise_website,
                       hs.name as site_name, 
                       hs.main_image as site_image,
                       (SELECT COUNT(*) FROM messages WHERE conversation_id = c.id AND sender_type = 'enterprise' AND is_read = false) as unread_count
                FROM conversations c
                LEFT JOIN enterprises e ON c.enterprise_id = e.id
                LEFT JOIN heritage_sites hs ON c.site_id = hs.id
                WHERE c.user_id = $1 AND c.status = 'active'
                ORDER BY c.last_message_at DESC NULLS LAST, c.updated_at DESC
            `;
            
            const result = await db.query(query, [userId]);
            return result.rows;
        } catch (error) {
            console.error('Error getting user conversations:', error);
            throw error;
        }
    }

    // Get enterprise's conversations
    static async getEnterpriseConversations(enterpriseId) {
        try {
            const query = `
                SELECT c.*, 
                       u.email as user_email, 
                       u.id as user_id,
                       u.full_name as user_name,
                       u.phone as user_phone,
                       hs.name as site_name, 
                       hs.main_image as site_image,
                       (SELECT COUNT(*) FROM messages WHERE conversation_id = c.id AND sender_type = 'user' AND is_read = false) as unread_count
                FROM conversations c
                LEFT JOIN users u ON c.user_id = u.id
                LEFT JOIN heritage_sites hs ON c.site_id = hs.id
                WHERE c.enterprise_id = $1 AND c.status = 'active'
                ORDER BY c.last_message_at DESC NULLS LAST, c.updated_at DESC
            `;
            
            const result = await db.query(query, [enterpriseId]);
            return result.rows;
        } catch (error) {
            console.error('Error getting enterprise conversations:', error);
            throw error;
        }
    }

    // Send a message
    static async sendMessage(conversationId, senderId, senderType, message, attachments = null) {
        console.log('sendMessage called with:', { conversationId, senderId, senderType, message });
        
        try {
            // Start transaction
            await db.query('BEGIN');
            
            // First, verify the conversation exists
            const convCheck = await db.query('SELECT * FROM conversations WHERE id = $1', [conversationId]);
            console.log('Conversation exists:', convCheck.rows[0]);
            
            if (convCheck.rows.length === 0) {
                throw new Error(`Conversation ${conversationId} not found`);
            }
            
            // Insert message
            const messageQuery = `
                INSERT INTO messages (conversation_id, sender_id, sender_type, message, attachments, created_at)
                VALUES ($1, $2, $3, $4, $5, NOW())
                RETURNING *
            `;
            
            console.log('Executing message insert with:', [conversationId, senderId, senderType, message, attachments]);
            
            const messageResult = await db.query(messageQuery, [
                conversationId, senderId, senderType, message, attachments
            ]);
            
            console.log('Message inserted:', messageResult.rows[0]);
            
            // Update conversation last message
            const updateQuery = `
                UPDATE conversations 
                SET last_message = $1, 
                    last_message_at = NOW(),
                    updated_at = NOW(),
                    unread_count_user = CASE WHEN $2 = 'enterprise' THEN unread_count_user + 1 ELSE unread_count_user END,
                    unread_count_enterprise = CASE WHEN $2 = 'user' THEN unread_count_enterprise + 1 ELSE unread_count_enterprise END
                WHERE id = $3
                RETURNING *
            `;
            
            const updateResult = await db.query(updateQuery, [message, senderType, conversationId]);
            console.log('Conversation updated:', updateResult.rows[0]);
            
            // Commit transaction
            await db.query('COMMIT');
            
            return messageResult.rows[0];
        } catch (error) {
            // Rollback on error
            await db.query('ROLLBACK');
            console.error('Error in sendMessage:', error);
            console.error('Error stack:', error.stack);
            throw error;
        }
    }

    // Get messages for a conversation
    static async getMessages(conversationId, limit = 50, offset = 0) {
        try {
            const query = `
                SELECT m.*, 
                       CASE 
                           WHEN m.sender_type = 'user' THEN u.full_name
                           ELSE e.enterprise_name
                       END as sender_name,
                       CASE 
                           WHEN m.sender_type = 'user' THEN u.email
                           ELSE e.enterprise_name
                       END as sender_email
                FROM messages m
                LEFT JOIN users u ON m.sender_type = 'user' AND m.sender_id = u.id
                LEFT JOIN enterprises e ON m.sender_type = 'enterprise' AND m.sender_id = e.id
                WHERE m.conversation_id = $1
                ORDER BY m.created_at ASC
                LIMIT $2 OFFSET $3
            `;
            
            const result = await db.query(query, [conversationId, limit, offset]);
            return result.rows;
        } catch (error) {
            console.error('Error getting messages:', error);
            throw error;
        }
    }

    // Mark messages as read (for user)
    static async markAsRead(conversationId, userId) {
        try {
            const query = `
                UPDATE messages 
                SET is_read = true, read_at = NOW()
                WHERE conversation_id = $1 
                  AND sender_type = 'enterprise' 
                  AND is_read = false
            `;
            
            await db.query(query, [conversationId]);
            
            // Reset unread count for user
            const resetQuery = `
                UPDATE conversations 
                SET unread_count_user = 0
                WHERE id = $1 AND user_id = $2
            `;
            
            await db.query(resetQuery, [conversationId, userId]);
            
            return true;
        } catch (error) {
            console.error('Error marking messages as read:', error);
            throw error;
        }
    }

    // Mark messages as read (for enterprise)
    static async markEnterpriseAsRead(conversationId, enterpriseId) {
        try {
            const query = `
                UPDATE messages 
                SET is_read = true, read_at = NOW()
                WHERE conversation_id = $1 
                  AND sender_type = 'user' 
                  AND is_read = false
            `;
            
            await db.query(query, [conversationId]);
            
            // Reset unread count for enterprise
            const resetQuery = `
                UPDATE conversations 
                SET unread_count_enterprise = 0
                WHERE id = $1 AND enterprise_id = $2
            `;
            
            await db.query(resetQuery, [conversationId, enterpriseId]);
            
            return true;
        } catch (error) {
            console.error('Error marking messages as read:', error);
            throw error;
        }
    }

    // Archive conversation
    static async archiveConversation(conversationId) {
        try {
            const query = `
                UPDATE conversations 
                SET status = 'archived', updated_at = NOW()
                WHERE id = $1
                RETURNING *
            `;
            
            const result = await db.query(query, [conversationId]);
            return result.rows[0];
        } catch (error) {
            console.error('Error archiving conversation:', error);
            throw error;
        }
    }

    // Get tourist details with stats
    static async getTouristDetails(userId) {
        try {
            // Get user profile
            const userQuery = `
                SELECT u.id, u.email, u.created_at as joined_date,
                       u.full_name, u.phone, u.profile_image
                FROM users u
                WHERE u.id = $1
            `;
            const userResult = await db.query(userQuery, [userId]);
            
            if (userResult.rows.length === 0) {
                return null;
            }
            
            // Get booking stats
            const statsQuery = `
                SELECT 
                    COUNT(*) as total_bookings,
                    COALESCE(SUM(total_amount), 0) as total_spent,
                    MAX(created_at) as last_active
                FROM bookings
                WHERE user_id = $1
            `;
            const statsResult = await db.query(statsQuery, [userId]);
            
            return {
                ...userResult.rows[0],
                total_bookings: parseInt(statsResult.rows[0]?.total_bookings || 0),
                total_spent: parseFloat(statsResult.rows[0]?.total_spent || 0),
                last_active: statsResult.rows[0]?.last_active || userResult.rows[0].joined_date
            };
        } catch (error) {
            console.error('Error getting tourist details:', error);
            throw error;
        }
    }

    // Get unread count for user
    static async getUnreadCountForUser(userId) {
        try {
            const query = `
                SELECT COALESCE(SUM(unread_count_user), 0) as total_unread
                FROM conversations
                WHERE user_id = $1 AND status = 'active'
            `;
            const result = await db.query(query, [userId]);
            return parseInt(result.rows[0].total_unread);
        } catch (error) {
            console.error('Error getting unread count:', error);
            throw error;
        }
    }

    // Get unread count for enterprise
    static async getUnreadCountForEnterprise(enterpriseId) {
        try {
            const query = `
                SELECT COALESCE(SUM(unread_count_enterprise), 0) as total_unread
                FROM conversations
                WHERE enterprise_id = $1 AND status = 'active'
            `;
            const result = await db.query(query, [enterpriseId]);
            return parseInt(result.rows[0].total_unread);
        } catch (error) {
            console.error('Error getting unread count:', error);
            throw error;
        }
    }
}

module.exports = Message;