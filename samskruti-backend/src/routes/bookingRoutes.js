// routes/bookingRoutes.js
const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Ticket = require('../models/Ticket');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { checkUserType } = require('../middlewares/checkUserType');

// ============================================
// USER BOOKING ROUTES (Protected)
// ============================================

// Create a new booking
router.post('/', authMiddleware, async (req, res) => {
    try {
        const {
            site_id,
            travel_date,
            travelers,
            special_requests,
            total_amount
        } = req.body;

        // Validate required fields
        if (!site_id || !travel_date || !travelers || !total_amount) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: site_id, travel_date, travelers, total_amount'
            });
        }

        // Get user_id from authenticated user
        const user_id = req.user.id;

        // Create booking
        const booking = await Booking.create({
            user_id,
            site_id,
            travel_date,
            travelers,
            special_requests,
            total_amount
        });

        // Create ticket for the booking
        const ticket = await Ticket.create({
            booking_id: booking.id,
            user_id,
            site_id,
            site_name: booking.site_name, // Note: You might need to fetch site details
            site_location: booking.site_location,
            travel_date,
            travelers,
            total_price: total_amount
        });

        res.status(201).json({
            success: true,
            message: 'Booking created successfully',
            data: {
                booking,
                ticket
            }
        });
    } catch (error) {
        console.error('Error creating booking:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create booking',
            error: error.message
        });
    }
});

// Get user's bookings
router.get('/user', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const bookings = await Booking.getUserBookings(userId);

        res.json({
            success: true,
            data: bookings,
            count: bookings.length
        });
    } catch (error) {
        console.error('Error fetching user bookings:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch bookings',
            error: error.message
        });
    }
});

// Get user's upcoming bookings
router.get('/user/upcoming', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const bookings = await Booking.getUpcomingBookings(userId);

        res.json({
            success: true,
            data: bookings,
            count: bookings.length
        });
    } catch (error) {
        console.error('Error fetching upcoming bookings:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch upcoming bookings',
            error: error.message
        });
    }
});

// Get user's past bookings
router.get('/user/past', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const bookings = await Booking.getPastBookings(userId);

        res.json({
            success: true,
            data: bookings,
            count: bookings.length
        });
    } catch (error) {
        console.error('Error fetching past bookings:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch past bookings',
            error: error.message
        });
    }
});

// Get user's booking statistics
router.get('/user/stats', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const stats = await Booking.getUserStats(userId);

        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Error fetching booking stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch booking statistics',
            error: error.message
        });
    }
});

// ============================================
// SINGLE BOOKING ROUTES (Protected)
// ============================================

// Get booking by ID
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const booking = await Booking.findById(id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // Check if the booking belongs to the user or user is admin
        if (booking.user_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized to view this booking'
            });
        }

        res.json({
            success: true,
            data: booking
        });
    } catch (error) {
        console.error('Error fetching booking:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch booking',
            error: error.message
        });
    }
});

// Get booking by reference
router.get('/reference/:reference', authMiddleware, async (req, res) => {
    try {
        const { reference } = req.params;
        const booking = await Booking.findByReference(reference);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // Check if the booking belongs to the user or user is admin
        if (booking.user_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized to view this booking'
            });
        }

        res.json({
            success: true,
            data: booking
        });
    } catch (error) {
        console.error('Error fetching booking by reference:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch booking',
            error: error.message
        });
    }
});

// Cancel booking
router.post('/:id/cancel', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        // Get booking to check ownership
        const booking = await Booking.findById(id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // Check if the booking belongs to the user
        if (booking.user_id !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized to cancel this booking'
            });
        }

        // Check if booking can be cancelled (e.g., not already cancelled or completed)
        if (booking.status === 'cancelled') {
            return res.status(400).json({
                success: false,
                message: 'Booking is already cancelled'
            });
        }

        if (booking.status === 'completed') {
            return res.status(400).json({
                success: false,
                message: 'Cannot cancel a completed booking'
            });
        }

        // Cancel booking
        const cancelledBooking = await Booking.cancel(id, reason);

        res.json({
            success: true,
            message: 'Booking cancelled successfully',
            data: cancelledBooking
        });
    } catch (error) {
        console.error('Error cancelling booking:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to cancel booking',
            error: error.message
        });
    }
});

// ============================================
// ADMIN ROUTES (Protected + Admin only)
// ============================================

// Get all bookings (admin only)
router.get('/admin/all', authMiddleware, checkUserType(['admin']), async (req, res) => {
    try {
        // This would need a new method in the Booking model
        // For now, we'll use a simple query
        const db = require('../config/database');
        const query = `
            SELECT b.*, 
                   hs.name as site_name, 
                   u.email as user_email,
                   e.company_name as enterprise_name
            FROM bookings b
            JOIN heritage_sites hs ON b.site_id = hs.id
            JOIN users u ON b.user_id = u.id
            LEFT JOIN enterprises e ON b.enterprise_id = e.id
            ORDER BY b.created_at DESC
        `;
        const result = await db.query(query);

        res.json({
            success: true,
            data: result.rows,
            count: result.rows.length
        });
    } catch (error) {
        console.error('Error fetching all bookings:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch bookings',
            error: error.message
        });
    }
});

// Update booking status (admin only)
router.put('/admin/:id/status', authMiddleware, checkUserType(['admin']), async (req, res) => {
    try {
        const { id } = req.params;
        const { status, payment_status } = req.body;

        if (!status && !payment_status) {
            return res.status(400).json({
                success: false,
                message: 'At least one of status or payment_status is required'
            });
        }

        const booking = await Booking.updateStatus(id, status, payment_status);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        res.json({
            success: true,
            message: 'Booking status updated successfully',
            data: booking
        });
    } catch (error) {
        console.error('Error updating booking status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update booking status',
            error: error.message
        });
    }
});

// Get bookings by date range (admin only)
router.get('/admin/date-range', authMiddleware, checkUserType(['admin']), async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: 'Start date and end date are required'
            });
        }

        const bookings = await Booking.getByDateRange(startDate, endDate);

        res.json({
            success: true,
            data: bookings,
            count: bookings.length
        });
    } catch (error) {
        console.error('Error fetching bookings by date range:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch bookings',
            error: error.message
        });
    }
});

module.exports = router;