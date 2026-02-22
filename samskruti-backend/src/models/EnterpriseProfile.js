const db = require('../config/database');

class EnterpriseProfile {
  static async create(profileData) {
    const {
      user_id,
      company_name,
      registration_number,
      gst_number,
      pan_number,
      company_phone,
      company_email,
      website,
      address,
      city,
      state,
      country,
      pincode,
      established_year,
      employee_count,
      business_type,
      description,
      logo,
      documents
    } = profileData;

    const query = `
      INSERT INTO enterprise_profiles (
        user_id, company_name, registration_number, gst_number, pan_number,
        company_phone, company_email, website, address, city, state, country,
        pincode, established_year, employee_count, business_type, description,
        logo, documents
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
      RETURNING *
    `;
    
    const values = [
      user_id,
      company_name,
      registration_number,
      gst_number || null,
      pan_number || null,
      company_phone || null,
      company_email || null,
      website || null,
      address || null,
      city || null,
      state || null,
      country || 'India',
      pincode || null,
      established_year || null,
      employee_count || null,
      business_type || null,
      description || null,
      logo || null,
      documents || []
    ];

    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async findByUserId(userId) {
    const query = 'SELECT * FROM enterprise_profiles WHERE user_id = $1';
    const result = await db.query(query, [userId]);
    return result.rows[0];
  }

  static async findByRegistrationNumber(regNumber) {
    const query = 'SELECT * FROM enterprise_profiles WHERE registration_number = $1';
    const result = await db.query(query, [regNumber]);
    return result.rows[0];
  }

  static async update(userId, updateData) {
    const allowedFields = [
      'company_name', 'gst_number', 'pan_number', 'company_phone',
      'company_email', 'website', 'address', 'city', 'state', 'country',
      'pincode', 'established_year', 'employee_count', 'business_type',
      'description', 'logo', 'documents', 'verified'
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
      UPDATE enterprise_profiles 
      SET ${updates.join(', ')}
      WHERE user_id = $${paramIndex}
      RETURNING *
    `;

    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async getAllVerified() {
    const query = 'SELECT * FROM enterprise_profiles WHERE verified = true';
    const result = await db.query(query);
    return result.rows;
  }
}

module.exports = EnterpriseProfile;