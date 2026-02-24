// models/Booking.js
const db = require('../config/database');

class Booking {
    // Create a new booking
    static async create(bookingData) {
        const client = await db.connect();
        try {
            await client.query('BEGIN');

            const {
                user_id,
                site_id,
                enterprise_id,
                travel_date,
                travelers,
                special_requests,
                total_amount
            } = bookingData;

            // Generate booking reference
            const booking_reference = 'BK' + Date.now().toString(36).toUpperCase() + 
                                      Math.random().toString(36).substr(2, 5).toUpperCase();

            const query = `
                INSERT INTO bookings (
                    booking_reference, user_id, site_id, enterprise_id,
                    travel_date, travelers, special_requests, total_amount,
                    status, payment_status, created_at
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'confirmed', 'pending', NOW())
                RETURNING *
            `;

            const values = [
                booking_reference,
                user_id,
                site_id,
                enterprise_id || null,
                travel_date,
                travelers,
                special_requests || null,
                total_amount
            ];

            const result = await client.query(query, values);
            
            // Also add to user_scheduled_visits
            await client.query(`
                INSERT INTO user_scheduled_visits (user_id, site_id, scheduled_date, booking_id)
                VALUES ($1, $2, $3, $4)
            `, [user_id, site_id, travel_date, result.rows[0].id]);

            await client.query('COMMIT');
            return result.rows[0];
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Error creating booking:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    // Get booking by ID
    static async findById(id) {
        try {
            const query = `
                SELECT b.*, 
                       hs.name as site_name, hs.location as site_location, hs.main_image as site_image,
                       e.company_name as enterprise_name
                FROM bookings b
                JOIN heritage_sites hs ON b.site_id = hs.id
                LEFT JOIN enterprises e ON b.enterprise_id = e.id
                WHERE b.id = $1
            `;
            const result = await db.query(query, [id]);
            return result.rows[0];
        } catch (error) {
            console.error('Error finding booking by ID:', error);
            throw error;
        }
    }

    // Get booking by reference
    static async findByReference(bookingReference) {
        try {
            const query = `
                SELECT b.*, 
                       hs.name as site_name, hs.location as site_location, hs.main_image as site_image,
                       e.company_name as enterprise_name
                FROM bookings b
                JOIN heritage_sites hs ON b.site_id = hs.id
                LEFT JOIN enterprises e ON b.enterprise_id = e.id
                WHERE b.booking_reference = $1
            `;
            const result = await db.query(query, [bookingReference]);
            return result.rows[0];
        } catch (error) {
            console.error('Error finding booking by reference:', error);
            throw error;
        }
    }

    // Get user's bookings
    static async getUserBookings(userId) {
        try {
            const query = `
                SELECT b.*, 
                       hs.name as site_name, hs.location as site_location, 
                       hs.main_image as site_image, hs.category,
                       e.company_name as enterprise_name
                FROM bookings b
                JOIN heritage_sites hs ON b.site_id = hs.id
                LEFT JOIN enterprises e ON b.enterprise_id = e.id
                WHERE b.user_id = $1
                ORDER BY b.travel_date DESC
            `;
            const result = await db.query(query, [userId]);
            return result.rows;
        } catch (error) {
            console.error('Error getting user bookings:', error);
            throw error;
        }
    }

    // Get upcoming bookings
    static async getUpcomingBookings(userId) {
        try {
            const query = `
                SELECT b.*, 
                       hs.name as site_name, hs.location as site_location, 
                       hs.main_image as site_image,
                       e.company_name as enterprise_name
                FROM bookings b
                JOIN heritage_sites hs ON b.site_id = hs.id
                LEFT JOIN enterprises e ON b.enterprise_id = e.id
                WHERE b.user_id = $1 
                  AND b.travel_date >= CURRENT_DATE
                  AND b.status NOT IN ('cancelled', 'completed')
                ORDER BY b.travel_date
            `;
            const result = await db.query(query, [userId]);
            return result.rows;
        } catch (error) {
            console.error('Error getting upcoming bookings:', error);
            throw error;
        }
    }

    // Get past bookings
    static async getPastBookings(userId) {
        try {
            const query = `
                SELECT b.*, 
                       hs.name as site_name, hs.location as site_location, 
                       hs.main_image as site_image,
                       e.company_name as enterprise_name
                FROM bookings b
                JOIN heritage_sites hs ON b.site_id = hs.id
                LEFT JOIN enterprises e ON b.enterprise_id = e.id
                WHERE b.user_id = $1 
                  AND (b.travel_date < CURRENT_DATE OR b.status = 'completed')
                ORDER BY b.travel_date DESC
            `;
            const result = await db.query(query, [userId]);
            return result.rows;
        } catch (error) {
            console.error('Error getting past bookings:', error);
            throw error;
        }
    }

    // Update booking status
    static async updateStatus(id, status, paymentStatus) {
        try {
            const query = `
                UPDATE bookings 
                SET status = $1, payment_status = $2, updated_at = NOW()
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
    static async cancel(id, reason) {
        const client = await db.connect();
        try {
            await client.query('BEGIN');

            const query = `
                UPDATE bookings 
                SET status = 'cancelled', payment_status = 'refunded', 
                    updated_at = NOW()
                WHERE id = $1
                RETURNING *
            `;
            const result = await client.query(query, [id]);

            // Update scheduled visits
            if (result.rows[0]) {
                await client.query(`
                    UPDATE user_scheduled_visits 
                    SET notes = $1
                    WHERE booking_id = $2
                `, [`Cancelled: ${reason || 'No reason provided'}`, id]);
            }

            await client.query('COMMIT');
            return result.rows[0];
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Error cancelling booking:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    // Get booking statistics for user
    static async getUserStats(userId) {
        try {
            const query = `
                SELECT 
                    COUNT(*) as total_bookings,
                    COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as active_bookings,
                    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_bookings,
                    COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_bookings,
                    SUM(CASE WHEN status = 'confirmed' THEN total_amount ELSE 0 END) as total_spent
                FROM bookings
                WHERE user_id = $1
            `;
            const result = await db.query(query, [userId]);
            return result.rows[0];
        } catch (error) {
            console.error('Error getting user booking stats:', error);
            throw error;
        }
    }

    // Get bookings by date range
    static async getByDateRange(startDate, endDate) {
        try {
            const query = `
                SELECT b.*, 
                       hs.name as site_name, u.email as user_email
                FROM bookings b
                JOIN heritage_sites hs ON b.site_id = hs.id
                JOIN users u ON b.user_id = u.id
                WHERE b.travel_date BETWEEN $1 AND $2
                ORDER BY b.travel_date
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