const db = require('../../config/database');
const crypto = require('crypto');

class CouponController {
  // Get all coupons
  static async getCoupons(req, res) {
    try {
      const sellerId = req.sellerId;
      const { page = 1, limit = 10, status, search } = req.query;
      const offset = (page - 1) * limit;

      let query = 'SELECT * FROM seller_coupons WHERE seller_id = $1';
      const params = [sellerId];
      let paramIndex = 2;

      if (status && status !== 'all' && status !== '') {
        query += ` AND status = $${paramIndex}`;
        params.push(status);
        paramIndex++;
      }

      if (search && search.trim() !== '') {
        query += ` AND (code ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`;
        params.push(`%${search}%`);
        paramIndex++;
      }

      query += ' ORDER BY created_at DESC LIMIT $' + paramIndex + ' OFFSET $' + (paramIndex + 1);
      params.push(parseInt(limit), offset);

      const coupons = await db.query(query, params);

      // Get total count
      let countQuery = 'SELECT COUNT(*) FROM seller_coupons WHERE seller_id = $1';
      const countParams = [sellerId];
      let countIndex = 2;

      if (status && status !== 'all' && status !== '') {
        countQuery += ' AND status = $' + countIndex;
        countParams.push(status);
        countIndex++;
      }

      if (search && search.trim() !== '') {
        countQuery += ' AND (code ILIKE $' + countIndex + ' OR description ILIKE $' + countIndex + ')';
        countParams.push(`%${search}%`);
      }

      const total = await db.query(countQuery, countParams);

      // Simple stats
      let stats = {
        total: parseInt(total.rows[0].count),
        active: 0,
        expired: 0,
        scheduled: 0,
        disabled: 0,
        total_used: 0,
        total_discount: 0
      };

      res.json({
        success: true,
        data: coupons.rows || [],
        stats: stats,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: parseInt(total.rows[0].count),
          pages: Math.ceil(parseInt(total.rows[0].count) / parseInt(limit))
        }
      });
    } catch (error) {
      console.error('Get coupons error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to load coupons'
      });
    }
  }

  // Create coupon - MINIMAL VERSION (only 5 required fields)
  static async createCoupon(req, res) {
    try {
      const sellerId = req.sellerId;
      const {
        code,           // Required
        description,    // Required
        discount_type,  // Required (percentage/fixed/free_shipping)
        discount_value, // Required
        end_date       // Required
      } = req.body;

      console.log('Creating coupon for seller:', sellerId);
      console.log('Coupon data:', req.body);

      // Validate ONLY the 5 required fields
      if (!code || !description || !discount_type || !discount_value || !end_date) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: code, description, discount_type, discount_value, end_date are required'
        });
      }

      // Generate unique code
      const couponCode = code.toUpperCase().replace(/\s/g, '');

      // Check if code already exists
      const existing = await db.query(
        'SELECT id FROM seller_coupons WHERE code = $1',
        [couponCode]
      );

      if (existing.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Coupon code already exists'
        });
      }

      // Set start_date to today if not provided
      const startDate = req.body.start_date || new Date().toISOString().split('T')[0];

      // Determine status based on dates
      let status;
      const now = new Date();
      const start = new Date(startDate);
      const end = new Date(end_date);
      
      if (start > now) {
        status = 'scheduled';
      } else if (end < now) {
        status = 'expired';
      } else {
        status = 'active';
      }

      // MINIMAL INSERT - only insert the fields we have
      // All other columns will be NULL (which is fine since they're nullable)
      const insertQuery = `
        INSERT INTO seller_coupons (
          seller_id,
          code,
          description,
          discount_type,
          discount_value,
          start_date,
          end_date,
          status,
          created_at,
          updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
        RETURNING *
      `;

      const insertValues = [
        sellerId,                 // $1
        couponCode,               // $2
        description,              // $3
        discount_type,            // $4
        parseFloat(discount_value), // $5
        startDate,                // $6
        end_date,                 // $7
        status                    // $8
      ];

      console.log('Insert query:', insertQuery);
      console.log('Insert values:', insertValues);

      const coupon = await db.query(insertQuery, insertValues);

      console.log('Coupon created:', coupon.rows[0]);

      res.json({
        success: true,
        message: 'Coupon created successfully',
        data: coupon.rows[0]
      });
    } catch (error) {
      console.error('Create coupon error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create coupon',
        error: error.message
      });
    }
  }

  // Get single coupon
  static async getCoupon(req, res) {
    try {
      const sellerId = req.sellerId;
      const couponId = req.params.id;

      const coupon = await db.query(
        'SELECT * FROM seller_coupons WHERE id = $1 AND seller_id = $2',
        [couponId, sellerId]
      );

      if (coupon.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Coupon not found'
        });
      }

      res.json({
        success: true,
        data: coupon.rows[0]
      });
    } catch (error) {
      console.error('Get coupon error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to load coupon'
      });
    }
  }

  // Update coupon status only (minimal update)
  static async updateCoupon(req, res) {
    try {
      const sellerId = req.sellerId;
      const couponId = req.params.id;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({
          success: false,
          message: 'Status is required'
        });
      }

      const coupon = await db.query(`
        UPDATE seller_coupons 
        SET status = $1, updated_at = NOW()
        WHERE id = $2 AND seller_id = $3
        RETURNING *
      `, [status, couponId, sellerId]);

      if (coupon.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Coupon not found'
        });
      }

      res.json({
        success: true,
        message: 'Coupon updated successfully',
        data: coupon.rows[0]
      });
    } catch (error) {
      console.error('Update coupon error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update coupon'
      });
    }
  }

  // Delete coupon
  static async deleteCoupon(req, res) {
    try {
      const sellerId = req.sellerId;
      const couponId = req.params.id;

      const result = await db.query(
        'DELETE FROM seller_coupons WHERE id = $1 AND seller_id = $2 RETURNING id',
        [couponId, sellerId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Coupon not found'
        });
      }

      res.json({
        success: true,
        message: 'Coupon deleted successfully'
      });
    } catch (error) {
      console.error('Delete coupon error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete coupon'
      });
    }
  }
}

module.exports = CouponController;