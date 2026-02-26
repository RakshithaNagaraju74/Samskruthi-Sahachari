// routes/ticketRoutes.js
const express = require('express');
const router = express.Router();
const Ticket = require('../models/Ticket');
const Booking = require('../models/Booking');
const { authMiddleware } = require('../middlewares/authMiddleware');
const rateLimit = require('express-rate-limit');
const db = require('../config/database');

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
        
        // Use the Ticket model instead of direct db query
        const ticket = await Ticket.findByTicketNumber(ticketNumber);
        
        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: 'Ticket not found'
            });
        }

        // Check if user owns this ticket
        if (ticket.user_id !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized to view this ticket'
            });
        }

        // Fetch associated booking to get additional details
        let extendedTicket = { ...ticket };
        
        if (ticket.booking_id) {
            try {
                const booking = await Booking.findById(ticket.booking_id);
                if (booking) {
                    extendedTicket = {
                        ...ticket,
                        travel_date: booking.travel_date,
                        travelers: booking.travelers,
                        total_amount: booking.total_amount,
                        booking_reference: booking.booking_reference,
                    };
                }
            } catch (bookingError) {
                console.error('Error fetching booking details:', bookingError);
            }
        }
        
        res.json({
            success: true,
            data: extendedTicket
        });
    } catch (error) {
        console.error('Error fetching ticket:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch ticket',
            error: error.message
        });
    }
});

// ============= MARK TICKET AS USED ENDPOINTS =============

// Staff scans QR code to mark ticket as used (staff/admin only)
router.post('/tickets/:ticketNumber/use', authMiddleware, async (req, res) => {
    try {
        const { ticketNumber } = req.params;
        const { location, method = 'qr_scan' } = req.body;
        
        // Check if user is staff or admin (you need to add this to your user model)
        // For now, we'll allow any authenticated user, but you should restrict this
        if (req.user.role !== 'admin' && req.user.role !== 'staff') {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized. Only staff can scan tickets.'
            });
        }
        
        const result = await Ticket.markAsUsed(ticketNumber, method, location);
        
        if (result.success) {
            res.json({ 
                success: true, 
                message: 'Ticket validated successfully!', 
                data: result.ticket 
            });
        } else {
            res.status(400).json({ 
                success: false, 
                message: result.message 
            });
        }
    } catch (error) {
        console.error('Error marking ticket as used:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
});

// User self check-in with geolocation verification
router.post('/tickets/self-checkin', authMiddleware, async (req, res) => {
    try {
        const { ticketNumber, latitude, longitude } = req.body;
        const userId = req.user.id;
        
        // Get ticket details
        const ticket = await Ticket.findByTicketNumber(ticketNumber);
        
        if (!ticket) {
            return res.status(404).json({ 
                success: false, 
                message: 'Ticket not found' 
            });
        }
        
        // Verify ticket belongs to user
        if (ticket.user_id !== userId) {
            return res.status(403).json({ 
                success: false, 
                message: 'Unauthorized' 
            });
        }
        
        // Get site location from database
        const siteQuery = await db.query(
            'SELECT latitude, longitude, name FROM heritage_sites WHERE id = $1',
            [ticket.site_id]
        );
        
        const site = siteQuery.rows[0];
        
        if (!site || !site.latitude || !site.longitude) {
            return res.status(404).json({ 
                success: false, 
                message: 'Site location not available for check-in' 
            });
        }
        
        // Calculate distance between user and site (using Haversine formula)
        const distance = calculateDistance(
            latitude, 
            longitude, 
            site.latitude, 
            site.longitude
        );
        
        // Allow check-in if within 100 meters (0.1 km)
        if (distance > 0.1) {
            return res.status(400).json({ 
                success: false, 
                message: `You are ${(distance * 1000).toFixed(0)} meters away from the site. Please get closer to check in.`,
                distance: distance
            });
        }
        
        // Mark ticket as used
        const result = await Ticket.markAsUsed(
            ticketNumber, 
            'self_checkin', 
            JSON.stringify({ latitude, longitude })
        );
        
        if (result.success) {
            res.json({ 
                success: true, 
                message: 'Check-in successful! Enjoy your visit!',
                data: result.ticket
            });
        } else {
            res.status(400).json({ 
                success: false, 
                message: result.message 
            });
        }
        
    } catch (error) {
        console.error('Error in self check-in:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
});

// Helper function to calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in km
}

// ============= END OF MARK AS USED ENDPOINTS =============

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
// routes/ticketRoutes.js - Add this endpoint

// Admin endpoint to manually process tickets (protected, admin only)
router.post('/admin/process-tickets', authMiddleware, async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized. Admin access required.'
            });
        }
        
        console.log('🔧 Manually processing tickets...');
        
        // Process travel dates
        const usedTickets = await Ticket.processTravelDates();
        
        // Process expired tickets
        const expiredTickets = await Ticket.markExpiredTickets();
        
        res.json({
            success: true,
            message: 'Tickets processed successfully',
            data: {
                used_tickets: usedTickets.length,
                expired_tickets: expiredTickets.length,
                used_details: usedTickets,
                expired_details: expiredTickets
            }
        });
        
    } catch (error) {
        console.error('Error processing tickets:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to process tickets',
            error: error.message
        });
    }
});

module.exports = router;