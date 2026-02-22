const db = require('../config/database');

class CraftingPlace {
  // Get all crafting places
  static async getAll() {
    try {
      const query = 'SELECT * FROM crafting_places ORDER BY rating DESC';
      const result = await db.query(query);
      return result.rows;
    } catch (error) {
      console.error('Error getting all crafting places:', error);
      throw error;
    }
  }

  // Get crafting place by ID
  static async findById(id) {
    try {
      const query = 'SELECT * FROM crafting_places WHERE id = $1';
      const result = await db.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error finding crafting place by ID:', error);
      throw error;
    }
  }

  // Get crafting places by destination
  static async getByDestination(destinationId) {
    try {
      const query = 'SELECT * FROM crafting_places WHERE destination_id = $1 ORDER BY rating DESC';
      const result = await db.query(query, [destinationId]);
      return result.rows;
    } catch (error) {
      console.error('Error getting crafting places by destination:', error);
      throw error;
    }
  }

  // Get crafting places by type
  static async getByType(type) {
    try {
      const query = 'SELECT * FROM crafting_places WHERE type = $1 ORDER BY rating DESC';
      const result = await db.query(query, [type]);
      return result.rows;
    } catch (error) {
      console.error('Error getting crafting places by type:', error);
      throw error;
    }
  }

  // Get crafting places by craft
  static async getByCraft(craft) {
    try {
      const query = 'SELECT * FROM crafting_places WHERE craft ILIKE $1 ORDER BY rating DESC';
      const result = await db.query(query, [`%${craft}%`]);
      return result.rows;
    } catch (error) {
      console.error('Error getting crafting places by craft:', error);
      throw error;
    }
  }

  // Get places with workshops
  static async getWithWorkshops() {
    try {
      const query = 'SELECT * FROM crafting_places WHERE workshop_available = true ORDER BY rating DESC';
      const result = await db.query(query);
      return result.rows;
    } catch (error) {
      console.error('Error getting places with workshops:', error);
      throw error;
    }
  }
}

module.exports = CraftingPlace;