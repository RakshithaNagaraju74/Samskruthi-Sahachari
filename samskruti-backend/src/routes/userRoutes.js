// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/authMiddleware');
const User = require('../models/User');
const UserProfile = require('../models/UserProfile');
const Booking = require('../models/Booking');
const Ticket = require('../models/Ticket');
const Review = require('../models/Review');

// Get current user profile
router.get('/profile', authMiddleware, async (req, res) => {
    try {
        console.log('Profile request for user ID:', req.user.id);
        
        const user = await User.findById(req.user.id);
        const profile = await UserProfile.findByUserId(req.user.id);
        
        console.log('Found user:', user);
        console.log('Found profile:', profile);
        
        res.json({
            success: true,
            data: {
                user,
                profile
            }
        });
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching profile'
        });
    }
});

// Update user profile
router.put('/profile', authMiddleware, async (req, res) => {
    try {
        const { full_name, phone, date_of_birth, gender, city, state, country, profile_image } = req.body;
        
        const updatedProfile = await UserProfile.update(req.user.id, {
            full_name,
            phone,
            date_of_birth,
            gender,
            city,
            state,
            country,
            profile_image
        });
        
        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: updatedProfile
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating profile'
        });
    }
});

// Get user's bookings
router.get('/bookings', authMiddleware, async (req, res) => {
    try {
        const bookings = await Booking.getUserBookings(req.user.id);
        
        res.json({
            success: true,
            data: bookings
        });
    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching bookings'
        });
    }
});

// Get upcoming bookings
router.get('/bookings/upcoming', authMiddleware, async (req, res) => {
    try {
        const bookings = await Booking.getUpcomingBookings(req.user.id);
        
        res.json({
            success: true,
            data: bookings
        });
    } catch (error) {
        console.error('Error fetching upcoming bookings:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching upcoming bookings'
        });
    }
});

// Get past bookings
router.get('/bookings/past', authMiddleware, async (req, res) => {
    try {
        const bookings = await Booking.getPastBookings(req.user.id);
        
        res.json({
            success: true,
            data: bookings
        });
    } catch (error) {
        console.error('Error fetching past bookings:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching past bookings'
        });
    }
});

// Get user's tickets
router.get('/tickets', authMiddleware, async (req, res) => {
    try {
        const tickets = await Ticket.getUserTickets(req.user.id);
        
        res.json({
            success: true,
            data: tickets
        });
    } catch (error) {
        console.error('Error fetching tickets:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching tickets'
        });
    }
});

// Get upcoming tickets
router.get('/tickets/upcoming', authMiddleware, async (req, res) => {
    try {
        const tickets = await Ticket.getUpcomingTickets(req.user.id);
        
        res.json({
            success: true,
            data: tickets
        });
    } catch (error) {
        console.error('Error fetching upcoming tickets:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching upcoming tickets'
        });
    }
});

// Get user's wishlist
router.get('/wishlist', authMiddleware, async (req, res) => {
    try {
        const wishlist = await User.getWishlist(req.user.id);
        
        res.json({
            success: true,
            data: wishlist
        });
    } catch (error) {
        console.error('Error fetching wishlist:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching wishlist'
        });
    }
});

// Add to wishlist
router.post('/wishlist/:siteId', authMiddleware, async (req, res) => {
    try {
        const { siteId } = req.params;
        
        const result = await User.addToWishlist(req.user.id, siteId);
        
        res.json({
            success: true,
            message: 'Added to wishlist',
            data: result
        });
    } catch (error) {
        console.error('Error adding to wishlist:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding to wishlist'
        });
    }
});

// Remove from wishlist
router.delete('/wishlist/:siteId', authMiddleware, async (req, res) => {
    try {
        const { siteId } = req.params;
        
        await User.removeFromWishlist(req.user.id, siteId);
        
        res.json({
            success: true,
            message: 'Removed from wishlist'
        });
    } catch (error) {
        console.error('Error removing from wishlist:', error);
        res.status(500).json({
            success: false,
            message: 'Error removing from wishlist'
        });
    }
});

// Get user's visited sites
router.get('/visits', authMiddleware, async (req, res) => {
    try {
        const visits = await User.getVisitedSites(req.user.id);
        
        res.json({
            success: true,
            data: visits
        });
    } catch (error) {
        console.error('Error fetching visits:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching visits'
        });
    }
});

// Get user's scheduled visits
router.get('/scheduled', authMiddleware, async (req, res) => {
    try {
        const scheduled = await User.getScheduledVisits(req.user.id);
        
        res.json({
            success: true,
            data: scheduled
        });
    } catch (error) {
        console.error('Error fetching scheduled visits:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching scheduled visits'
        });
    }
});

// Get user's reviews
router.get('/reviews', authMiddleware, async (req, res) => {
    try {
        const reviews = await Review.getByUserId(req.user.id);
        
        res.json({
            success: true,
            data: reviews
        });
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching reviews'
        });
    }
});

// Get user statistics
router.get('/stats', authMiddleware, async (req, res) => {
    try {
        const bookingStats = await Booking.getUserStats(req.user.id);
        const ticketStats = await Ticket.getStats(req.user.id);
        
        res.json({
            success: true,
            data: {
                bookings: bookingStats,
                tickets: ticketStats
            }
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching statistics'
        });
    }
});

module.exports = router;