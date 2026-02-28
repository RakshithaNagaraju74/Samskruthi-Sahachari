const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Ticket = require('../models/Ticket');
const { authMiddleware } = require('../middlewares/authMiddleware');
const db = require('../config/database');

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

// Create booking (updated to handle promo code)
// Create booking (updated to handle promo code)
router.post('/', authMiddleware, async (req, res) => {
    const client = await db.pool.connect(); // if using pool, otherwise use db directly
    try {
        await client.query('BEGIN');

        const {
            site_id,
            enterprise_id,
            travel_date,
            travelers,
            special_requests,
            total_amount,
            pickup_point,
            promo_code
        } = req.body;

        // Generate booking reference
        const booking_reference = 'BK' + Date.now() + Math.random().toString(36).substring(2, 8).toUpperCase();

        let finalTotal = total_amount;
        let discountAmount = 0;
        let influencerCommission = 0;
        let promoCodeId = null;

        // If promo code provided, validate it
        if (promo_code) {
            console.log('🔍 Processing promo code:', promo_code);
            const promoQuery = await client.query(`
                SELECT 
                    pc.*,
                    i.commission_rate
                FROM promo_codes pc
                JOIN influencers i ON pc.influencer_id = i.id
                WHERE pc.code = $1 
                  AND pc.is_active = true 
                  AND pc.valid_from <= CURRENT_DATE 
                  AND pc.valid_to >= CURRENT_DATE
            `, [promo_code]);

            if (promoQuery.rows.length === 0) {
                await client.query('ROLLBACK');
                return res.status(400).json({ success: false, message: 'Invalid or expired promo code' });
            }

            const promo = promoQuery.rows[0];
            console.log('✅ Promo found:', promo);

            // Check usage limit
            if (promo.usage_limit && promo.times_used >= promo.usage_limit) {
                await client.query('ROLLBACK');
                return res.status(400).json({ success: false, message: 'Promo code usage limit exceeded' });
            }

            // Calculate discount
            if (promo.discount_type === 'percentage') {
                discountAmount = (total_amount * promo.discount_value) / 100;
            } else {
                discountAmount = promo.discount_value;
            }

            if (discountAmount > total_amount) discountAmount = total_amount;

            finalTotal = total_amount - discountAmount;
            influencerCommission = (finalTotal * promo.commission_rate) / 100;
            promoCodeId = promo.id;
        }

        const bookingData = {
            user_id: req.user.id,
            site_id,
            enterprise_id,
            travel_date,
            travelers,
            special_requests,
            total_amount: finalTotal,
            booking_reference,
            pickup_point: pickup_point || null,
            promo_code_id: promoCodeId,
            discount_amount: discountAmount,
            influencer_commission: influencerCommission
        };

        const booking = await Booking.create(bookingData);

        // If promo code was used, update its times_used and influencer's total_earnings
        if (promoCodeId) {
            console.log('📈 Updating promo code usage for ID:', promoCodeId);
            await client.query(
                'UPDATE promo_codes SET times_used = times_used + 1, updated_at = NOW() WHERE id = $1',
                [promoCodeId]
            );

            const promoInfo = await client.query('SELECT influencer_id FROM promo_codes WHERE id = $1', [promoCodeId]);
            if (promoInfo.rows.length > 0) {
                await client.query(
                    'UPDATE influencers SET total_earnings = total_earnings + $1, updated_at = NOW() WHERE id = $2',
                    [influencerCommission, promoInfo.rows[0].influencer_id]
                );
            }
        }

        await client.query('COMMIT');
        res.status(201).json({
            success: true,
            message: 'Booking created successfully',
            data: booking
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Error creating booking:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create booking',
            error: error.message
        });
    } finally {
        client.release();
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