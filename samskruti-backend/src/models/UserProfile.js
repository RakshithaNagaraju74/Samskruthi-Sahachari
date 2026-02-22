const db = require('../config/database');

class UserProfile {
  static async create(profileData) {
    const {
      user_id,
      full_name,
      phone,
      date_of_birth,
      gender,
      profile_picture,
      preferences
    } = profileData;

    const query = `
      INSERT INTO user_profiles (
        user_id, full_name, phone, date_of_birth, gender, profile_picture, preferences
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    
    const values = [
      user_id,
      full_name,
      phone || null,
      date_of_birth || null,
      gender || null,
      profile_picture || null,
      preferences || {}
    ];

    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async findByUserId(userId) {
    const query = 'SELECT * FROM user_profiles WHERE user_id = $1';
    const result = await db.query(query, [userId]);
    return result.rows[0];
  }

  static async update(userId, updateData) {
    const allowedFields = [
      'full_name', 'phone', 'date_of_birth', 'gender', 
      'profile_picture', 'preferences'
    ];

    const updates = [];
    const values = [];
    let paramIndex = 1;

    Object.keys(updateData).forEach(key => {
      if (allowedFields.includes(key) && updateData[key] !== undefined) {
        updates.push(`${key} = $${paramIndex}`);
        values.push(updateData[key]);
        paramIndex++;
      }
    });

    if (updates.length === 0) return null;

    values.push(userId);
    const query = `
      UPDATE user_profiles 
      SET ${updates.join(', ')}
      WHERE user_id = $${paramIndex}
      RETURNING *
    `;

    const result = await db.query(query, values);
    return result.rows[0];
  }
}

module.exports = UserProfile;