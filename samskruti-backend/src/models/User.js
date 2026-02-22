const db = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  static async create(userData) {
    const { email, password, user_type } = userData;
    
    // Hash password
    const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS));
    const password_hash = await bcrypt.hash(password, salt);

    const query = `
      INSERT INTO users (email, password_hash, user_type)
      VALUES ($1, $2, $3)
      RETURNING id, email, user_type, created_at
    `;
    
    const values = [email, password_hash, user_type];
    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await db.query(query, [email]);
    return result.rows[0];
  }

  // src/models/User.js - Update findById method

static async findById(id) {
  try {
    const query = 'SELECT id, email, user_type, is_active, email_verified, last_login, created_at FROM users WHERE id = $1';
    const result = await db.query(query, [id]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return result.rows[0];
  } catch (error) {
    console.error('Error in findById:', error);
    throw error;
  }
}

  static async verifyPassword(user, password) {
    return bcrypt.compare(password, user.password_hash);
  }

  static async updateLastLogin(id) {
    const query = 'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1';
    await db.query(query, [id]);
  }

  static async createSession(userId, token, deviceInfo, ipAddress, expiresAt) {
    try {
      // Convert deviceInfo to proper JSON format
      let deviceInfoJson;
      
      if (!deviceInfo) {
        deviceInfoJson = JSON.stringify({});
      } else if (typeof deviceInfo === 'string') {
        // If it's a string (like user-agent), wrap it in an object
        deviceInfoJson = JSON.stringify({ 
          userAgent: deviceInfo,
          timestamp: new Date().toISOString()
        });
      } else if (typeof deviceInfo === 'object') {
        // If it's already an object, ensure it's stringified properly
        deviceInfoJson = JSON.stringify({
          ...deviceInfo,
          timestamp: new Date().toISOString()
        });
      } else {
        deviceInfoJson = JSON.stringify({ 
          data: String(deviceInfo),
          timestamp: new Date().toISOString()
        });
      }

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
        console.log('Session created without device_info (fallback)');
        return result.rows[0];
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
        throw error;
      }
    }
  }

  static async findSession(token) {
    const query = 'SELECT * FROM user_sessions WHERE token = $1 AND expires_at > NOW()';
    const result = await db.query(query, [token]);
    return result.rows[0];
  }

  static async deleteSession(token) {
    const query = 'DELETE FROM user_sessions WHERE token = $1';
    await db.query(query, [token]);
  }

  static async deleteUserSessions(userId) {
    const query = 'DELETE FROM user_sessions WHERE user_id = $1';
    await db.query(query, [userId]);
  }
}

module.exports = User;