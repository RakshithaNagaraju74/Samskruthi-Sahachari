const db = require('../config/database');

class Booking {
  // Create a new booking
  static async create(bookingData) {
    try {
      const {
        user_id,
        destination_id,
        enterprise_id,
        booking_date,
        travel_date,
        travelers,
        total_price,
        contact_phone,
        contact_email,
        special_requests
      } = bookingData;

      // Generate booking ID
      const bookingId = 'BK' + Date.now().toString().slice(-6);

      const query = `
        INSERT INTO bookings (
          booking_id, user_id, destination_id, enterprise_id,
          booking_date, travel_date, travelers, total_price,
          contact_phone, contact_email, special_requests,
          status, payment_status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'pending', 'pending')
        RETURNING *
      `;

      const values = [
        bookingId,
        user_id,
        destination_id,
        enterprise_id || null,
        booking_date,
        travel_date,
        travelers,
        total_price,
        contact_phone,
        contact_email,
        special_requests || null
      ];

      const result = await db.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error creating booking:', error);
      throw error;
    }
  }

  // Get booking by ID
  static async findById(id) {
    try {
      const query = 'SELECT * FROM bookings WHERE id = $1';
      const result = await db.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error finding booking by ID:', error);
      throw error;
    }
  }

  // Get booking by booking ID
  static async findByBookingId(bookingId) {
    try {
      const query = 'SELECT * FROM bookings WHERE booking_id = $1';
      const result = await db.query(query, [bookingId]);
      return result.rows[0];
    } catch (error) {
      console.error('Error finding booking by booking ID:', error);
      throw error;
    }
  }

  // Get user's bookings
  static async getUserBookings(userId) {
    try {
      const query = `
        SELECT b.*, d.name as destination_name, d.image 
        FROM bookings b
        JOIN destinations d ON d.id = b.destination_id
        WHERE b.user_id = $1
        ORDER BY b.created_at DESC
      `;
      const result = await db.query(query, [userId]);
      return result.rows;
    } catch (error) {
      console.error('Error getting user bookings:', error);
      throw error;
    }
  }

  // Update booking status
  static async updateStatus(id, status, paymentStatus) {
    try {
      const query = `
        UPDATE bookings 
        SET status = $1, payment_status = $2
        WHERE id = $3
        RETURNING *
      `;
      const result = await db.query(query, [status, paymentStatus, id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error updating booking status:', error);
      throw error;
    }
  }

  // Cancel booking
  static async cancel(id) {
    try {
      const query = `
        UPDATE bookings 
        SET status = 'cancelled', payment_status = 'refunded'
        WHERE id = $1
        RETURNING *
      `;
      const result = await db.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error cancelling booking:', error);
      throw error;
    }
  }

  // Get bookings by date range
  static async getByDateRange(startDate, endDate) {
    try {
      const query = `
        SELECT * FROM bookings 
        WHERE travel_date BETWEEN $1 AND $2
        ORDER BY travel_date
      `;
      const result = await db.query(query, [startDate, endDate]);
      return result.rows;
    } catch (error) {
      console.error('Error getting bookings by date range:', error);
      throw error;
    }
  }
}

module.exports = Booking;