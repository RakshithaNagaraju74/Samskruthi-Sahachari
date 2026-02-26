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

    // ============= NEW METHODS TO ADD =============

    // Update refresh token
    // In User model, update the updateRefreshToken method to be optional
static async updateRefreshToken(userId, refreshToken) {
    try {
        // First check if column exists
        const checkQuery = `
            SELECT EXISTS (
                SELECT FROM information_schema.columns 
                WHERE table_name = 'users' AND column_name = 'refresh_token'
            );
        `;
        const checkResult = await db.query(checkQuery);
        
        if (checkResult.rows[0].exists) {
            const query = 'UPDATE users SET refresh_token = $1 WHERE id = $2';
            await db.query(query, [refreshToken, userId]);
        } else {
            console.log('refresh_token column does not exist, skipping');
        }
        return true;
    } catch (error) {
        console.log('Note: Could not update refresh token - column may not exist');
        return false;
    }
}

    // Update last login
    static async updateLastLogin(userId) {
        try {
            const query = 'UPDATE users SET last_login = NOW() WHERE id = $1';
            await db.query(query, [userId]);
            return true;
        } catch (error) {
            console.error('Error updating last login:', error);
            throw error;
        }
    }

    // Verify password
    static async verifyPassword(user, password) {
        return bcrypt.compare(password, user.password_hash);
    }

    // ============= EXISTING METHODS =============

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

    // ==================== WISHLIST METHODS ====================

    // Add to wishlist
    static async addToWishlist(userId, siteId) {
        try {
            console.log(`Checking if site ${siteId} exists...`);
            
            // Check if site exists
            const siteCheck = await db.query(
                `SELECT EXISTS (SELECT 1 FROM heritage_sites WHERE id = $1) as exists`,
                [siteId]
            );
            
            if (!siteCheck.rows[0]?.exists) {
                console.log(`Site ID ${siteId} not found`);
                return { 
                    success: false, 
                    error: 'Site not found in database',
                    code: 'SITE_NOT_FOUND'
                };
            }
            
            console.log(`Site ${siteId} found, adding to wishlist...`);
            
            // Check if already in wishlist
            const existing = await db.query(
                'SELECT * FROM wishlist WHERE user_id = $1 AND site_id = $2',
                [userId, siteId]
            );
            
            if (existing.rows.length > 0) {
                return { 
                    success: false, 
                    error: 'Site already in wishlist',
                    code: 'ALREADY_EXISTS'
                };
            }
            
            // Add to wishlist
            const result = await db.query(
                'INSERT INTO wishlist (user_id, site_id, created_at) VALUES ($1, $2, NOW()) RETURNING *',
                [userId, siteId]
            );
            
            console.log(`Site ${siteId} added to wishlist successfully`);
            return { success: true, data: result.rows[0] };
            
        } catch (error) {
            console.error('Error in addToWishlist:', error);
            
            if (error.code === '23503') {
                return { 
                    success: false, 
                    error: 'Site does not exist in database',
                    code: 'SITE_NOT_FOUND'
                };
            }
            
            return { success: false, error: error.message };
        }
    }

    // Remove from wishlist
    static async removeFromWishlist(userId, siteId) {
        try {
            const result = await db.query(
                'DELETE FROM wishlist WHERE user_id = $1 AND site_id = $2 RETURNING *',
                [userId, siteId]
            );
            
            return { success: true, data: result.rows[0] };
        } catch (error) {
            console.error('Error removing from wishlist:', error);
            return { success: false, error: error.message };
        }
    }

    // Get wishlist
    static async getWishlist(userId) {
        try {
            console.log(`Fetching wishlist for user ${userId}...`);
            
            const result = await db.query(`
                SELECT 
                    w.*,
                    hs.name as site_name,
                    hs.location as site_location,
                    hs.main_image as site_image,
                    hs.category as category,
                    hs.rating as rating
                FROM wishlist w
                LEFT JOIN heritage_sites hs ON w.site_id = hs.id
                WHERE w.user_id = $1
                ORDER BY w.created_at DESC
            `, [userId]);
            
            console.log(`Found ${result.rows.length} wishlist items`);
            return { success: true, data: result.rows };
        } catch (error) {
            console.error('Error getting wishlist:', error);
            return { success: false, error: error.message, data: [] };
        }
    }

    // Check if site is in wishlist
    static async checkWishlist(userId, siteId) {
        try {
            const result = await db.query(
                'SELECT * FROM wishlist WHERE user_id = $1 AND site_id = $2',
                [userId, siteId]
            );
            
            return { success: true, inWishlist: result.rows.length > 0 };
        } catch (error) {
            console.error('Error checking wishlist:', error);
            return { success: false, error: error.message, inWishlist: false };
        }
    }

    // ==================== VISITS METHODS ====================

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