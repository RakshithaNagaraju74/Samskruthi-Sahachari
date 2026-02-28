const db = require('../config/database');

const getAllProductsPublic = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        p.id,
        p.name,
        p.description,
        p.price,
        p.thumbnail,
        p.sku,
        p.quantity,
        p.status,
        p.created_at,
        s.id as seller_id,
        s.shop_name as seller_shop_name
      FROM products p
      JOIN sellers s ON p.seller_id = s.id
      WHERE p.status = 'published' AND s.status = 'active'
      ORDER BY p.created_at DESC
    `);

    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch products' });
  }
};

module.exports = { getAllProductsPublic };