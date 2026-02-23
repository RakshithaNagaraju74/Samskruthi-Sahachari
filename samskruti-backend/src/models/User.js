// models/User.js
const db = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
    // Create new user
    static async create(userData) {
        const { email, password_hash, role } = userData;
        
        const query = `
            INSERT INTO users (email, password_hash, role, created_at, updated_at)
            VALUES ($1, $2, $3, NOW(), NOW())
            RETURNING id, email, role, created_at
        `;
        
        const values = [email, password_hash, role || 'user'];
        const result = await db.query(query, values);
        return result.rows[0];
    }

    // Find user by email
    static async findByEmail(email) {
        try {
            const query = 'SELECT * FROM users WHERE email = $1';
            const result = await db.query(query, [email]);
            return result.rows[0];
        } catch (error) {
            console.error('Error in findByEmail:', error);
            throw error;
        }
    }

    // Find user by ID
    static async findById(id) {
        try {
            const query = 'SELECT id, email, role, is_active, is_verified, last_login, created_at FROM users WHERE id = $1';
            const result = await db.query(query, [id]);
            return result.rows[0];
        } catch (error) {
            console.error('Error in findById:', error);
            throw error;
        }
    }

    // Verify password
    static async verifyPassword(user, password) {
        return bcrypt.compare(password, user.password_hash);
    }

    // Update last login
    static async updateLastLogin(id) {
        try {
            const query = 'UPDATE users SET last_login = NOW() WHERE id = $1';
            await db.query(query, [id]);
        } catch (error) {
            console.error('Error updating last login:', error);
            throw error;
        }
    }

    // Create session
    static async createSession(userId, token, deviceInfo, ipAddress, expiresAt) {
        try {
            const deviceInfoJson = typeof deviceInfo === 'string' 
                ? JSON.stringify({ userAgent: deviceInfo })
                : JSON.stringify(deviceInfo || {});

            const query = `
                INSERT INTO user_sessions (user_id, token, device_info, ip_address, expires_at)
                VALUES ($1, $2, $3::jsonb, $4, $5)
                RETURNING id
            `;
            
            const values = [userId, token, deviceInfoJson, ipAddress, expiresAt];
            const result = await db.query(query, values);
            return result.rows[0];
        } catch (error) {
            console.error('Error creating session:', error);
            
            // Fallback: try without device_info
            try {
                const fallbackQuery = `
                    INSERT INTO user_sessions (user_id, token, ip_address, expires_at)
                    VALUES ($1, $2, $3, $4)
                    RETURNING id
                `;
                const fallbackValues = [userId, token, ipAddress, expiresAt];
                const result = await db.query(fallbackQuery, fallbackValues);
                return result.rows[0];
            } catch (fallbackError) {
                console.error('Fallback also failed:', fallbackError);
                throw error;
            }
        }
    }

    // Find session
    static async findSession(token) {
        try {
            const query = 'SELECT * FROM user_sessions WHERE token = $1 AND expires_at > NOW()';
            const result = await db.query(query, [token]);
            return result.rows[0];
        } catch (error) {
            console.error('Error finding session:', error);
            throw error;
        }
    }

    // Delete session
    static async deleteSession(token) {
        try {
            const query = 'DELETE FROM user_sessions WHERE token = $1';
            await db.query(query, [token]);
        } catch (error) {
            console.error('Error deleting session:', error);
            throw error;
        }
    }

    // Delete all user sessions
    static async deleteUserSessions(userId) {
        try {
            const query = 'DELETE FROM user_sessions WHERE user_id = $1';
            await db.query(query, [userId]);
        } catch (error) {
            console.error('Error deleting user sessions:', error);
            throw error;
        }
    }

    // Get user's wishlist
    static async getWishlist(userId) {
        try {
            const query = `
                SELECT hs.* 
                FROM wishlist w
                JOIN heritage_sites hs ON w.site_id = hs.id
                WHERE w.user_id = $1
                ORDER BY w.created_at DESC
            `;
            const result = await db.query(query, [userId]);
            return result.rows;
        } catch (error) {
            console.error('Error getting wishlist:', error);
            throw error;
        }
    }

    // Add to wishlist
    static async addToWishlist(userId, siteId) {
        try {
            const query = `
                INSERT INTO wishlist (user_id, site_id)
                VALUES ($1, $2)
                ON CONFLICT (user_id, site_id) DO NOTHING
                RETURNING *
            `;
            const result = await db.query(query, [userId, siteId]);
            return result.rows[0];
        } catch (error) {
            console.error('Error adding to wishlist:', error);
            throw error;
        }
    }

    // Remove from wishlist
    static async removeFromWishlist(userId, siteId) {
        try {
            const query = 'DELETE FROM wishlist WHERE user_id = $1 AND site_id = $2';
            await db.query(query, [userId, siteId]);
            return true;
        } catch (error) {
            console.error('Error removing from wishlist:', error);
            throw error;
        }
    }

    // Get user's visited sites
    static async getVisitedSites(userId) {
        try {
            const query = `
                SELECT hs.*, uv.visit_date
                FROM user_visits uv
                JOIN heritage_sites hs ON uv.site_id = hs.id
                WHERE uv.user_id = $1
                ORDER BY uv.visit_date DESC
            `;
            const result = await db.query(query, [userId]);
            return result.rows;
        } catch (error) {
            console.error('Error getting visited sites:', error);
            throw error;
        }
    }

    // Get user's scheduled visits
    static async getScheduledVisits(userId) {
        try {
            const query = `
                SELECT hs.*, usv.scheduled_date, usv.notes, b.booking_reference
                FROM user_scheduled_visits usv
                JOIN heritage_sites hs ON usv.site_id = hs.id
                LEFT JOIN bookings b ON usv.booking_id = b.id
                WHERE usv.user_id = $1 AND usv.scheduled_date >= CURRENT_DATE
                ORDER BY usv.scheduled_date
            `;
            const result = await db.query(query, [userId]);
            return result.rows;
        } catch (error) {
            console.error('Error getting scheduled visits:', error);
            throw error;
        }
    }
}

module.exports = User;