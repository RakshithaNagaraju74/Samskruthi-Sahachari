const db = require('../../config/database');

class ReviewController {
  // Get all reviews for seller's products
  static async getReviews(req, res) {
    try {
      const sellerId = req.sellerId;
      const { page = 1, limit = 10, status, rating, search } = req.query;
      const offset = (page - 1) * limit;

      let query = `
        SELECT r.*, p.name as product_name, p.thumbnail as product_image,
               u.email as customer_email, u.id as customer_id
        FROM product_reviews r
        JOIN products p ON r.product_id = p.id
        JOIN users u ON r.user_id = u.id
        WHERE p.seller_id = $1
      `;
      const params = [sellerId];
      let paramIndex = 2;

      if (status) {
        query += ` AND r.status = $${paramIndex}`;
        params.push(status);
        paramIndex++;
      }

      if (rating) {
        query += ` AND r.rating = $${paramIndex}`;
        params.push(rating);
        paramIndex++;
      }

      if (search) {
        query += ` AND (p.name ILIKE $${paramIndex} OR r.comment ILIKE $${paramIndex} OR u.email ILIKE $${paramIndex})`;
        params.push(`%${search}%`);
        paramIndex++;
      }

      query += ` ORDER BY r.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      params.push(limit, offset);

      const reviews = await db.query(query, params);

      // Get total count
      let countQuery = `
        SELECT COUNT(*) 
        FROM product_reviews r
        JOIN products p ON r.product_id = p.id
        WHERE p.seller_id = $1
      `;
      const countParams = [sellerId];

      if (status) {
        countQuery += ` AND r.status = $2`;
        countParams.push(status);
      }

      const total = await db.query(countQuery, countParams);

      // Get statistics
      const stats = await ReviewController.getStats(sellerId);

      res.json({
        success: true,
        data: reviews.rows,
        stats,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: parseInt(total.rows[0].count),
          pages: Math.ceil(total.rows[0].count / limit)
        }
      });
    } catch (error) {
      console.error('Get reviews error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to load reviews'
      });
    }
  }

  // Get review statistics
  static async getStats(sellerId) {
    try {
      const result = await db.query(`
        SELECT 
          COUNT(*) as total,
          AVG(r.rating)::numeric(10,2) as average,
          COUNT(CASE WHEN r.status = 'pending' THEN 1 END) as pending,
          COUNT(CASE WHEN r.status = 'approved' THEN 1 END) as approved,
          COUNT(CASE WHEN r.status = 'rejected' THEN 1 END) as rejected,
          COUNT(CASE WHEN r.rating = 5 THEN 1 END) as five_star,
          COUNT(CASE WHEN r.rating = 4 THEN 1 END) as four_star,
          COUNT(CASE WHEN r.rating = 3 THEN 1 END) as three_star,
          COUNT(CASE WHEN r.rating = 2 THEN 1 END) as two_star,
          COUNT(CASE WHEN r.rating = 1 THEN 1 END) as one_star
        FROM product_reviews r
        JOIN products p ON r.product_id = p.id
        WHERE p.seller_id = $1
      `, [sellerId]);

      return result.rows[0];
    } catch (error) {
      console.error('Get review stats error:', error);
      throw error;
    }
  }

  // Update review status
  static async updateReviewStatus(req, res) {
    try {
      const sellerId = req.sellerId;
      const reviewId = req.params.id;
      const { status } = req.body;

      // Verify review belongs to seller's product
      const review = await db.query(`
        UPDATE product_reviews r
        SET status = $1, updated_at = NOW()
        FROM products p
        WHERE r.id = $2 
          AND r.product_id = p.id 
          AND p.seller_id = $3
        RETURNING r.*
      `, [status, reviewId, sellerId]);

      if (review.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Review not found'
        });
      }

      // Update product rating
      await db.query(`
        UPDATE products p
        SET rating = (
          SELECT AVG(rating)::numeric(10,2)
          FROM product_reviews
          WHERE product_id = p.id AND status = 'approved'
        ),
        review_count = (
          SELECT COUNT(*)
          FROM product_reviews
          WHERE product_id = p.id AND status = 'approved'
        )
        WHERE p.id = $1
      `, [review.rows[0].product_id]);

      res.json({
        success: true,
        message: 'Review status updated successfully',
        data: review.rows[0]
      });
    } catch (error) {
      console.error('Update review status error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update review status'
      });
    }
  }

  // Get review details
  static async getReview(req, res) {
    try {
      const sellerId = req.sellerId;
      const reviewId = req.params.id;

      const review = await db.query(`
        SELECT r.*, p.name as product_name, p.thumbnail as product_image,
               u.email as customer_email, u.id as customer_id,
               u.full_name as customer_name
        FROM product_reviews r
        JOIN products p ON r.product_id = p.id
        JOIN users u ON r.user_id = u.id
        WHERE r.id = $1 AND p.seller_id = $2
      `, [reviewId, sellerId]);

      if (review.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Review not found'
        });
      }

      res.json({
        success: true,
        data: review.rows[0]
      });
    } catch (error) {
      console.error('Get review error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to load review'
      });
    }
  }
  // Add this method to create a review
static async createReview(req, res) {
  try {
    const userId = req.user.id; // From auth middleware
    const { product_id, rating, title, comment } = req.body;

    // Check if user purchased this product
    const purchaseCheck = await db.query(`
      SELECT id FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      WHERE o.user_id = $1 AND oi.product_id = $2 AND o.status = 'delivered'
    `, [userId, product_id]);

    if (purchaseCheck.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'You can only review products you have purchased'
      });
    }

    // Check if already reviewed
    const existingReview = await db.query(
      'SELECT id FROM product_reviews WHERE user_id = $1 AND product_id = $2',
      [userId, product_id]
    );

    if (existingReview.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this product'
      });
    }

    // Create review - ONLY essential fields
    const review = await db.query(`
      INSERT INTO product_reviews (
        product_id, user_id, rating, title, comment, 
        status, created_at, verified_purchase
      ) VALUES ($1, $2, $3, $4, $5, 'pending', NOW(), true)
      RETURNING *
    `, [product_id, userId, rating, title, comment]);

    res.json({
      success: true,
      message: 'Review submitted successfully',
      data: review.rows[0]
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit review'
    });
  }
}
}

module.exports = ReviewController;