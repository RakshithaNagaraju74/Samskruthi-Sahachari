const db = require('../config/database');
const Ticket = require('../models/Ticket');
class Booking {
    // Create a new booking
    // models/Booking.js - Update the create method
static async create(bookingData) {
    try {
        const {
            user_id,
            site_id,
            enterprise_id,
            travel_date,
            travelers,
            special_requests,
            total_amount,
            booking_reference
        } = bookingData;

        // Create booking
        const bookingQuery = `
            INSERT INTO bookings (
                user_id,
                site_id,
                enterprise_id,
                booking_reference,
                travel_date,
                travelers,
                special_requests,
                total_amount,
                status,
                payment_status,
                created_at,
                updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'confirmed', 'paid', NOW(), NOW())
            RETURNING *
        `;

        const bookingValues = [
            user_id,
            site_id,
            enterprise_id || null,
            booking_reference,
            travel_date,
            travelers,
            special_requests || null,
            total_amount
        ];

        const bookingResult = await db.query(bookingQuery, bookingValues);
        const booking = bookingResult.rows[0];

        // Create ticket with travel date
        if (booking) {
            try {
                // Get site details
                const siteQuery = await db.query(
                    'SELECT name, location FROM heritage_sites WHERE id = $1',
                    [site_id]
                );
                const site = siteQuery.rows[0] || { 
                    name: 'Heritage Site', 
                    location: 'Karnataka' 
                };

                // Create ticket with travel date
                const ticket = await Ticket.create({
                    booking_id: booking.id,
                    user_id,
                    site_id,
                    site_name: site.name,
                    site_location: site.location,
                    travel_date // Pass travel_date to ticket
                });

                console.log(`✅ Ticket created for booking ${booking.id}: ${ticket.ticket_number} (Travel date: ${travel_date})`);

            } catch (ticketError) {
                console.error('Error creating ticket for booking:', ticketError);
            }
        }

        return booking;
    } catch (error) {
        console.error('Error creating booking:', error);
        throw error;
    }
}
    // Get booking by ID
    static async findById(id) {
        try {
            const query = `
                SELECT 
                    b.*,
                    hs.name as site_name,
                    hs.location as site_location,
                    hs.main_image as site_image,
                    e.enterprise_name as enterprise_name,
                    e.business_type as enterprise_type,
                    e.owner_name as enterprise_owner,
                    e.phone as enterprise_phone,
                    e.email as enterprise_email,
                    e.address as enterprise_address,
                    e.city as enterprise_city,
                    e.state as enterprise_state,
                    u.email as user_email
                FROM bookings b
                LEFT JOIN heritage_sites hs ON b.site_id = hs.id
                LEFT JOIN enterprises e ON b.enterprise_id = e.id
                LEFT JOIN users u ON b.user_id = u.id
                WHERE b.id = $1
            `;

            const result = await db.query(query, [id]);
            return result.rows[0] || null;
        } catch (error) {
            console.error('Error finding booking by ID:', error);
            throw error;
        }
    }

    // Get booking by reference
    static async findByReference(reference) {
        try {
            const query = `
                SELECT 
                    b.*,
                    hs.name as site_name,
                    hs.location as site_location,
                    hs.main_image as site_image,
                    e.enterprise_name as enterprise_name,
                    e.business_type as enterprise_type,
                    u.email as user_email
                FROM bookings b
                LEFT JOIN heritage_sites hs ON b.site_id = hs.id
                LEFT JOIN enterprises e ON b.enterprise_id = e.id
                LEFT JOIN users u ON b.user_id = u.id
                WHERE b.booking_reference = $1
            `;

            const result = await db.query(query, [reference]);
            return result.rows[0] || null;
        } catch (error) {
            console.error('Error finding booking by reference:', error);
            throw error;
        }
    }

    // Get bookings by user ID
    static async getUserBookings(userId) {
        try {
            const query = `
                SELECT 
                    b.*,
                    hs.name as site_name,
                    hs.location as site_location,
                    hs.main_image as site_image,
                    hs.category as site_category,
                    e.enterprise_name as enterprise_name,
                    e.business_type as enterprise_type,
                    u.email as user_email
                FROM bookings b
                LEFT JOIN heritage_sites hs ON b.site_id = hs.id
                LEFT JOIN enterprises e ON b.enterprise_id = e.id
                LEFT JOIN users u ON b.user_id = u.id
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

    // Get upcoming bookings for user
    static async getUpcomingUserBookings(userId) {
        try {
            const query = `
                SELECT 
                    b.*,
                    hs.name as site_name,
                    hs.location as site_location,
                    hs.main_image as site_image,
                    e.enterprise_name as enterprise_name
                FROM bookings b
                LEFT JOIN heritage_sites hs ON b.site_id = hs.id
                LEFT JOIN enterprises e ON b.enterprise_id = e.id
                WHERE b.user_id = $1 
                    AND b.travel_date >= CURRENT_DATE 
                    AND b.status IN ('pending', 'confirmed')
                ORDER BY b.travel_date ASC
            `;

            const result = await db.query(query, [userId]);
            return result.rows;
        } catch (error) {
            console.error('Error getting upcoming user bookings:', error);
            throw error;
        }
    }

    // Get past bookings for user
    static async getPastUserBookings(userId) {
        try {
            const query = `
                SELECT 
                    b.*,
                    hs.name as site_name,
                    hs.location as site_location,
                    hs.main_image as site_image,
                    e.enterprise_name as enterprise_name
                FROM bookings b
                LEFT JOIN heritage_sites hs ON b.site_id = hs.id
                LEFT JOIN enterprises e ON b.enterprise_id = e.id
                WHERE b.user_id = $1 
                    AND (b.travel_date < CURRENT_DATE OR b.status IN ('completed', 'cancelled'))
                ORDER BY b.created_at DESC
            `;

            const result = await db.query(query, [userId]);
            return result.rows;
        } catch (error) {
            console.error('Error getting past user bookings:', error);
            throw error;
        }
    }

    // Get bookings by site ID
    static async getBySiteId(siteId) {
        try {
            const query = `
                SELECT 
                    b.*,
                    u.email as user_email
                FROM bookings b
                LEFT JOIN users u ON b.user_id = u.id
                WHERE b.site_id = $1
                ORDER BY b.created_at DESC
            `;

            const result = await db.query(query, [siteId]);
            return result.rows;
        } catch (error) {
            console.error('Error getting bookings by site ID:', error);
            throw error;
        }
    }

    // Get bookings by enterprise ID
    static async getByEnterpriseId(enterpriseId) {
        try {
            const query = `
                SELECT 
                    b.*,
                    hs.name as site_name,
                    hs.location as site_location,
                    u.email as user_email,
                    u.full_name as user_name
                FROM bookings b
                LEFT JOIN heritage_sites hs ON b.site_id = hs.id
                LEFT JOIN users u ON b.user_id = u.id
                WHERE b.enterprise_id = $1
                ORDER BY b.created_at DESC
            `;

            const result = await db.query(query, [enterpriseId]);
            return result.rows;
        } catch (error) {
            console.error('Error getting bookings by enterprise ID:', error);
            throw error;
        }
    }

    // Update booking status
    static async updateStatus(id, status, payment_status = null) {
        try {
            let query;
            let values;

            if (payment_status) {
                query = `
                    UPDATE bookings 
                    SET status = $1, payment_status = $2, updated_at = NOW()
                    WHERE id = $3
                    RETURNING *
                `;
                values = [status, payment_status, id];
            } else {
                query = `
                    UPDATE bookings 
                    SET status = $1, updated_at = NOW()
                    WHERE id = $2
                    RETURNING *
                `;
                values = [status, id];
            }

            const result = await db.query(query, values);
            return result.rows[0];
        } catch (error) {
            console.error('Error updating booking status:', error);
            throw error;
        }
    }

    // Update payment status
    static async updatePaymentStatus(id, payment_status, payment_method = null) {
        try {
            let query;
            let values;

            if (payment_method) {
                query = `
                    UPDATE bookings 
                    SET payment_status = $1, payment_method = $2, updated_at = NOW()
                    WHERE id = $3
                    RETURNING *
                `;
                values = [payment_status, payment_method, id];
            } else {
                query = `
                    UPDATE bookings 
                    SET payment_status = $1, updated_at = NOW()
                    WHERE id = $2
                    RETURNING *
                `;
                values = [payment_status, id];
            }

            const result = await db.query(query, values);
            return result.rows[0];
        } catch (error) {
            console.error('Error updating payment status:', error);
            throw error;
        }
    }

    // Cancel booking
    static async cancel(id, reason = null) {
        try {
            const query = `
                UPDATE bookings 
                SET status = 'cancelled', 
                    cancellation_reason = $1,
                    updated_at = NOW()
                WHERE id = $2
                RETURNING *
            `;

            const result = await db.query(query, [reason, id]);
            return result.rows[0];
        } catch (error) {
            console.error('Error cancelling booking:', error);
            throw error;
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
                    COALESCE(SUM(total_amount), 0) as total_spent
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

    // Check if user has booked a site
    static async hasUserBookedSite(userId, siteId) {
        try {
            const query = `
                SELECT EXISTS(
                    SELECT 1 FROM bookings 
                    WHERE user_id = $1 
                        AND site_id = $2 
                        AND status IN ('confirmed', 'completed')
                ) as has_booked
            `;

            const result = await db.query(query, [userId, siteId]);
            return result.rows[0].has_booked;
        } catch (error) {
            console.error('Error checking if user booked site:', error);
            throw error;
        }
    }

    // Get bookings by date range
    static async getByDateRange(startDate, endDate, enterpriseId = null) {
        try {
            let query = `
                SELECT 
                    b.*,
                    hs.name as site_name,
                    u.email as user_email,
                    u.full_name as user_name
                FROM bookings b
                LEFT JOIN heritage_sites hs ON b.site_id = hs.id
                LEFT JOIN users u ON b.user_id = u.id
                WHERE b.travel_date BETWEEN $1 AND $2
            `;
            
            const values = [startDate, endDate];

            if (enterpriseId) {
                query += ` AND b.enterprise_id = $3`;
                values.push(enterpriseId);
            }

            query += ` ORDER BY b.travel_date ASC`;

            const result = await db.query(query, values);
            return result.rows;
        } catch (error) {
            console.error('Error getting bookings by date range:', error);
            throw error;
        }
    }
}

module.exports = Booking;