const db = require('../config/database');

class Eatery {
  // Get all eateries
  static async getAll() {
    try {
      const query = 'SELECT * FROM eateries ORDER BY rating DESC';
      const result = await db.query(query);
      return result.rows;
    } catch (error) {
      console.error('Error getting all eateries:', error);
      throw error;
    }
  }

  // Get eatery by ID
  static async findById(id) {
    try {
      const query = 'SELECT * FROM eateries WHERE id = $1';
      const result = await db.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error finding eatery by ID:', error);
      throw error;
    }
  }

  // Get eateries by destination
  static async getByDestination(destinationId) {
    try {
      const query = 'SELECT * FROM eateries WHERE destination_id = $1 ORDER BY rating DESC';
      const result = await db.query(query, [destinationId]);
      return result.rows;
    } catch (error) {
      console.error('Error getting eateries by destination:', error);
      throw error;
    }
  }

  // Get eateries by type
  static async getByType(type) {
    try {
      const query = 'SELECT * FROM eateries WHERE type = $1 ORDER BY rating DESC';
      const result = await db.query(query, [type]);
      return result.rows;
    } catch (error) {
      console.error('Error getting eateries by type:', error);
      throw error;
    }
  }

  // Get top rated eateries
  static async getTopRated(limit = 10) {
    try {
      const query = 'SELECT * FROM eateries ORDER BY rating DESC LIMIT $1';
      const result = await db.query(query, [limit]);
      return result.rows;
    } catch (error) {
      console.error('Error getting top rated eateries:', error);
      throw error;
    }
  }
}

module.exports = Eatery;