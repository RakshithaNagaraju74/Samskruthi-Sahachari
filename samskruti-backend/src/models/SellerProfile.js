const db = require('../config/database');

class SellerProfile {
  static async create(profileData) {
    const {
      user_id,
      shop_name,
      owner_name,
      shop_type,
      gst_number,
      pan_number,
      phone,
      alternate_phone,
      email,
      website,
      shop_address,
      city,
      state,
      country,
      pincode,
      established_year,
      business_description,
      product_categories,
      shop_images,
      documents
    } = profileData;

    const query = `
      INSERT INTO seller_profiles (
        user_id, shop_name, owner_name, shop_type, gst_number, pan_number,
        phone, alternate_phone, email, website, shop_address, city, state,
        country, pincode, established_year, business_description,
        product_categories, shop_images, documents
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
      RETURNING *
    `;
    
    const values = [
      user_id,
      shop_name,
      owner_name,
      shop_type || null,
      gst_number || null,
      pan_number || null,
      phone,
      alternate_phone || null,
      email || null,
      website || null,
      shop_address,
      city || null,
      state || null,
      country || 'India',
      pincode || null,
      established_year || null,
      business_description || null,
      product_categories || [],
      shop_images || [],
      documents || []
    ];

    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async findByUserId(userId) {
    const query = 'SELECT * FROM seller_profiles WHERE user_id = $1';
    const result = await db.query(query, [userId]);
    return result.rows[0];
  }

  static async findByShopName(shopName) {
    const query = 'SELECT * FROM seller_profiles WHERE shop_name ILIKE $1';
    const result = await db.query(query, [`%${shopName}%`]);
    return result.rows;
  }

  static async update(userId, updateData) {
    const allowedFields = [
      'shop_name', 'owner_name', 'shop_type', 'gst_number', 'pan_number',
      'phone', 'alternate_phone', 'email', 'website', 'shop_address',
      'city', 'state', 'country', 'pincode', 'established_year',
      'business_description', 'product_categories', 'shop_images',
      'documents', 'verified', 'rating', 'total_reviews'
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
      UPDATE seller_profiles 
      SET ${updates.join(', ')}
      WHERE user_id = $${paramIndex}
      RETURNING *
    `;

    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async updateRating(sellerId, newRating) {
    const query = `
      UPDATE seller_profiles 
      SET rating = $1, total_reviews = total_reviews + 1
      WHERE id = $2
      RETURNING *
    `;
    const result = await db.query(query, [newRating, sellerId]);
    return result.rows[0];
  }

  static async getByCategory(category) {
    const query = 'SELECT * FROM seller_profiles WHERE $1 = ANY(product_categories) AND verified = true';
    const result = await db.query(query, [category]);
    return result.rows;
  }

  static async getTopRated(limit = 10) {
    const query = 'SELECT * FROM seller_profiles WHERE verified = true ORDER BY rating DESC LIMIT $1';
    const result = await db.query(query, [limit]);
    return result.rows;
  }
}

module.exports = SellerProfile;