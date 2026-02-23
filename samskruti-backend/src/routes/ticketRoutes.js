// routes/ticketRoutes.js
const express = require('express');
const router = express.Router();
const Ticket = require('../models/Ticket');
const Booking = require('../models/Booking');
const { authMiddleware } = require('../middlewares/authMiddleware');
const rateLimit = require('express-rate-limit');

// Rate limiting for verification
const verifyLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50,
    message: { success: false, message: 'Too many verification attempts, please try again later' }
});

// Create ticket from booking (protected)
router.post('/create', authMiddleware, async (req, res) => {
    try {
        const {
            booking_id,
            site_id,
            site_name,
            site_location,
            travel_date,
            travelers,
            total_price
        } = req.body;

        const userId = req.user.id;

        const ticket = await Ticket.create({
            booking_id,
            user_id: userId,
            site_id,
            site_name,
            site_location,
            travel_date,
            travelers,
            total_price
        });

        res.json({
            success: true,
            message: 'Ticket created successfully',
            data: ticket
        });
    } catch (error) {
        console.error('Error creating ticket:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create ticket',
            error: error.message
        });
    }
});

// Get user's tickets (protected)
router.get('/user/:userId', authMiddleware, async (req, res) => {
    try {
        const { userId } = req.params;
        const { history } = req.query;

        // Ensure user can only access their own tickets
        if (parseInt(userId) !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized to access these tickets'
            });
        }

        const tickets = await Ticket.getUserTickets(userId, history === 'true');

        res.json({
            success: true,
            data: tickets,
            count: tickets.length
        });
    } catch (error) {
        console.error('Error fetching user tickets:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch tickets',
            error: error.message
        });
    }
});

// Get user's upcoming tickets (protected)
router.get('/user/:userId/upcoming', authMiddleware, async (req, res) => {
    try {
        const { userId } = req.params;

        if (parseInt(userId) !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized'
            });
        }

        const tickets = await Ticket.getUpcomingTickets(userId);

        res.json({
            success: true,
            data: tickets
        });
    } catch (error) {
        console.error('Error fetching upcoming tickets:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch upcoming tickets'
        });
    }
});

// Get single ticket by number (protected)
router.get('/:ticketNumber', authMiddleware, async (req, res) => {
    try {
        const { ticketNumber } = req.params;

        const ticket = await Ticket.findByTicketNumber(ticketNumber);

        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: 'Ticket not found'
            });
        }

        // Check if user owns the ticket
        if (ticket.user_id !== req.user.id && req.user.user_type !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized to view this ticket'
            });
        }

        // Remove sensitive data
        delete ticket.qr_token;
        delete ticket.hash;
        delete ticket.nonce;

        res.json({
            success: true,
            data: ticket
        });
    } catch (error) {
        console.error('Error fetching ticket:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch ticket'
        });
    }
});

// Verify ticket (public with rate limiting)
router.post('/verify', verifyLimiter, async (req, res) => {
    try {
        const { ticketNumber, qrToken } = req.body;

        if (!ticketNumber || !qrToken) {
            return res.status(400).json({
                success: false,
                message: 'Ticket number and QR token are required'
            });
        }

        const result = await Ticket.verify(ticketNumber, qrToken);

        res.json(result);
    } catch (error) {
        console.error('Error verifying ticket:', error);
        res.status(500).json({
            success: false,
            message: 'Verification failed',
            error: error.message
        });
    }
});

// Cancel ticket (protected)
router.post('/:ticketNumber/cancel', authMiddleware, async (req, res) => {
    try {
        const { ticketNumber } = req.params;
        const { reason } = req.body;
        const userId = req.user.id;

        const result = await Ticket.cancel(ticketNumber, userId, reason);

        if (result.success) {
            res.json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error('Error cancelling ticket:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to cancel ticket'
        });
    }
});

// Download ticket (protected)
router.get('/:ticketNumber/download', authMiddleware, async (req, res) => {
    try {
        const { ticketNumber } = req.params;
        
        const ticket = await Ticket.findByTicketNumber(ticketNumber);

        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: 'Ticket not found'
            });
        }

        if (ticket.user_id !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized'
            });
        }

        // Generate PDF or return ticket data
        res.json({
            success: true,
            data: {
                ticket_number: ticket.ticket_number,
                site_name: ticket.site_name,
                site_location: ticket.site_location,
                travel_date: ticket.travel_date,
                travelers: ticket.travelers,
                total_price: ticket.total_price,
                qr_code: ticket.qr_code,
                issued_at: ticket.issued_at
            }
        });
    } catch (error) {
        console.error('Error downloading ticket:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to download ticket'
        });
    }
});

// Get ticket statistics (protected)
router.get('/stats/:userId', authMiddleware, async (req, res) => {
    try {
        const { userId } = req.params;

        if (parseInt(userId) !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized'
            });
        }

        const stats = await Ticket.getStats(userId);

        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Error fetching ticket stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch ticket statistics'
        });
    }
});

module.exports = router;