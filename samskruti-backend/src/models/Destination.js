const db = require('../config/database');

class Destination {
  // Get all destinations
  static async getAll() {
    try {
      const query = 'SELECT * FROM destinations ORDER BY popularity_score DESC, rating DESC';
      const result = await db.query(query);
      return result.rows;
    } catch (error) {
      console.error('Error getting all destinations:', error);
      throw error;
    }
  }

  // Get destination by ID
  static async findById(id) {
    try {
      const query = 'SELECT * FROM destinations WHERE id = $1';
      const result = await db.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error finding destination by ID:', error);
      throw error;
    }
  }

  // Get destinations by category
  static async getByCategory(category) {
    try {
      const query = 'SELECT * FROM destinations WHERE category = $1 ORDER BY rating DESC';
      const result = await db.query(query, [category]);
      return result.rows;
    } catch (error) {
      console.error('Error getting destinations by category:', error);
      throw error;
    }
  }

  // Get popular destinations
  static async getPopular(limit = 10) {
    try {
      const query = 'SELECT * FROM destinations ORDER BY popularity_score DESC, rating DESC LIMIT $1';
      const result = await db.query(query, [limit]);
      return result.rows;
    } catch (error) {
      console.error('Error getting popular destinations:', error);
      throw error;
    }
  }

  // Search destinations
  static async search(searchTerm) {
    try {
      const query = `
        SELECT * FROM destinations 
        WHERE name ILIKE $1 
        OR location ILIKE $1 
        OR description ILIKE $1
        OR tags::text ILIKE $1
        ORDER BY popularity_score DESC
      `;
      const result = await db.query(query, [`%${searchTerm}%`]);
      return result.rows;
    } catch (error) {
      console.error('Error searching destinations:', error);
      throw error;
    }
  }

  // Get destinations by tag
  static async getByTag(tag) {
    try {
      const query = 'SELECT * FROM destinations WHERE $1 = ANY(tags)';
      const result = await db.query(query, [tag]);
      return result.rows;
    } catch (error) {
      console.error('Error getting destinations by tag:', error);
      throw error;
    }
  }

  // Get nearby destinations
  static async getNearby(lat, lng, radius = 50) {
    try {
      // Simple approximation: 1 degree ≈ 111 km
      const latDiff = radius / 111.0;
      const lngDiff = radius / (111.0 * Math.cos(lat * Math.PI / 180));
      
      const query = `
        SELECT * FROM destinations 
        WHERE latitude BETWEEN $1 AND $2
        AND longitude BETWEEN $3 AND $4
        ORDER BY popularity_score DESC
      `;
      const result = await db.query(query, [
        lat - latDiff, 
        lat + latDiff,
        lng - lngDiff,
        lng + lngDiff
      ]);
      return result.rows;
    } catch (error) {
      console.error('Error getting nearby destinations:', error);
      throw error;
    }
  }

  // Get user's viewed destinations history
  static async getUserHistory(userId) {
    try {
      const query = `
        SELECT d.*, dv.viewed_at 
        FROM destination_views dv
        JOIN destinations d ON d.id = dv.destination_id
        WHERE dv.user_id = $1
        ORDER BY dv.viewed_at DESC
      `;
      const result = await db.query(query, [userId]);
      return result.rows;
    } catch (error) {
      console.error('Error getting user history:', error);
      throw error;
    }
  }

  // Track destination view
  static async trackView(userId, destinationId) {
    try {
      const query = `
        INSERT INTO destination_views (user_id, destination_id, viewed_at)
        VALUES ($1, $2, CURRENT_TIMESTAMP)
      `;
      await db.query(query, [userId, destinationId]);
      
      // Update popularity score
      await this.incrementPopularity(destinationId);
    } catch (error) {
      console.error('Error tracking view:', error);
      throw error;
    }
  }

  // Increment popularity score
  static async incrementPopularity(destinationId) {
    try {
      const query = `
        UPDATE destinations 
        SET popularity_score = popularity_score + 1 
        WHERE id = $1
      `;
      await db.query(query, [destinationId]);
    } catch (error) {
      console.error('Error incrementing popularity:', error);
      throw error;
    }
  }

  // Get destinations with filters
  static async getFiltered(filters) {
    try {
      let query = 'SELECT * FROM destinations WHERE 1=1';
      const values = [];
      let paramCount = 1;

      if (filters.category) {
        query += ` AND category = $${paramCount}`;
        values.push(filters.category);
        paramCount++;
      }

      if (filters.minRating) {
        query += ` AND rating >= $${paramCount}`;
        values.push(filters.minRating);
        paramCount++;
      }

      if (filters.maxPrice) {
        query += ` AND CAST(REGEXP_REPLACE(price, '[^0-9]', '', 'g') AS INTEGER) <= $${paramCount}`;
        values.push(parseInt(filters.maxPrice.replace(/[^0-9]/g, '')));
        paramCount++;
      }

      if (filters.duration) {
        query += ` AND duration ILIKE $${paramCount}`;
        values.push(`%${filters.duration}%`);
        paramCount++;
      }

      query += ' ORDER BY popularity_score DESC, rating DESC';

      const result = await db.query(query, values);
      return result.rows;
    } catch (error) {
      console.error('Error getting filtered destinations:', error);
      throw error;
    }
  }

  // Get reviews for a destination
  static async getReviews(destinationId) {
    try {
      const query = `
        SELECT r.*, u.email, up.full_name 
        FROM reviews r
        JOIN users u ON u.id = r.user_id
        LEFT JOIN user_profiles up ON up.user_id = u.id
        WHERE r.destination_id = $1
        ORDER BY r.created_at DESC
      `;
      const result = await db.query(query, [destinationId]);
      return result.rows;
    } catch (error) {
      console.error('Error getting reviews:', error);
      throw error;
    }
  }

  // Add a review
  static async addReview(userId, destinationId, reviewData) {
    try {
      const { rating, title, comment, pros, cons, visit_date } = reviewData;
      const query = `
        INSERT INTO reviews (
          user_id, destination_id, rating, title, comment, 
          pros, cons, visit_date, helpful_count
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 0)
        RETURNING *
      `;
      const values = [userId, destinationId, rating, title, comment, pros || [], cons || [], visit_date];
      const result = await db.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error adding review:', error);
      throw error;
    }
  }
}

module.exports = Destination;