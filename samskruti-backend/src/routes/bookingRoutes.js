// src/routes/bookingRoutes.js
const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Ticket = require('../models/Ticket');
const { authMiddleware } = require('../middlewares/authMiddleware');

// Get user's bookings
router.get('/user', authMiddleware, async (req, res)=> {
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

// Get upcoming bookings
router.get('/user/upcoming', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const bookings = await Booking.getUpcomingUserBookings(userId);
        
        res.json({
            success: true,
            data: bookings,
            count: bookings.length
        });
    } catch (error) {
        console.error('Error fetching upcoming bookings:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch upcoming bookings'
        });
    }
});

// Get past bookings
router.get('/user/past', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const bookings = await Booking.getPastUserBookings(userId);
        
        res.json({
            success: true,
            data: bookings,
            count: bookings.length
        });
    } catch (error) {
        console.error('Error fetching past bookings:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch past bookings'
        });
    }
});

// Get user booking stats
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
            message: 'Failed to fetch booking stats'
        });
    }
});

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

        // Check if user owns this booking or is admin
        if (booking.user_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
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
            message: 'Failed to fetch booking'
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

        // Check if user owns this booking or is admin
        if (booking.user_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
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
            message: 'Failed to fetch booking'
        });
    }
});

// Create booking
router.post('/', authMiddleware, async (req, res) => {
    try {
        const {
            site_id,
            enterprise_id,
            travel_date,
            travelers,
            special_requests,
            total_amount
        } = req.body;

        // Generate booking reference
        const booking_reference = 'BK' + Date.now() + Math.random().toString(36).substring(2, 8).toUpperCase();

        const bookingData = {
            user_id: req.user.id,
            site_id,
            enterprise_id,
            travel_date,
            travelers,
            special_requests,
            total_amount,
            booking_reference
        };

        const booking = await Booking.create(bookingData);

        res.status(201).json({
            success: true,
            message: 'Booking created successfully',
            data: booking
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

// Cancel booking
router.post('/:id/cancel', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        
        const booking = await Booking.findById(id);
        
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // Check if user owns this booking
        if (booking.user_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        // Check if booking can be cancelled
        if (booking.status === 'cancelled') {
            return res.status(400).json({
                success: false,
                message: 'Booking is already cancelled'
            });
        }

        if (booking.status === 'completed') {
            return res.status(400).json({
                success: false,
                message: 'Completed bookings cannot be cancelled'
            });
        }

        const cancelledBooking = await Booking.cancel(id, reason);
        
        // Also cancel associated tickets
        await Ticket.cancelByBookingId(id, reason);

        res.json({
            success: true,
            message: 'Booking cancelled successfully',
            data: cancelledBooking
        });
    } catch (error) {
        console.error('Error cancelling booking:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to cancel booking'
        });
    }
});

module.exports = router;