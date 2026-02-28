const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authMiddleware, authorize } = require('../middlewares/authMiddleware');

// All routes require authentication
router.use(authMiddleware);

// ==================== PUBLIC ROUTES (for validation) ====================
// Validate a promo code (any authenticated user can use)
router.post('/validate', async (req, res) => {
    try {
        const { code } = req.body;
        if (!code) {
            return res.status(400).json({ success: false, message: 'Promo code required' });
        }

        const promoQuery = await db.query(`
            SELECT 
                pc.*,
                i.commission_rate
            FROM promo_codes pc
            JOIN influencers i ON pc.influencer_id = i.id
            WHERE pc.code = $1 
              AND pc.is_active = true 
              AND pc.valid_from <= CURRENT_DATE 
              AND pc.valid_to >= CURRENT_DATE
        `, [code]);

        if (promoQuery.rows.length === 0) {
            return res.json({ success: false, message: 'Invalid or expired promo code' });
        }

        const promo = promoQuery.rows[0];

        // Check usage limit
        if (promo.usage_limit && promo.times_used >= promo.usage_limit) {
            return res.json({ success: false, message: 'Promo code usage limit exceeded' });
        }

        res.json({
            success: true,
            data: {
                id: promo.id,
                code: promo.code,
                discount_type: promo.discount_type,
                discount_value: promo.discount_value,
                influencer_id: promo.influencer_id,
                commission_rate: promo.commission_rate
            }
        });

    } catch (error) {
        console.error('Error validating promo code:', error);
        res.status(500).json({ success: false, message: 'Failed to validate promo code' });
    }
});

// ==================== INFLUENCER-ONLY ROUTES ====================
// Middleware to check if user is an influencer
const authorizeInfluencer = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const influencerQuery = await db.query(
            'SELECT id FROM influencers WHERE user_id = $1',
            [userId]
        );
        if (influencerQuery.rows.length === 0) {
            return res.status(403).json({ success: false, message: 'Access denied. Not an influencer.' });
        }
        req.influencerId = influencerQuery.rows[0].id;
        next();
    } catch (error) {
        console.error('Error authorizing influencer:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Create a new promo code (influencer only)
router.post('/', authorizeInfluencer, async (req, res) => {
    try {
        const {
            code,
            discount_type,
            discount_value,
            valid_from,
            valid_to,
            usage_limit
        } = req.body;

        if (!code || !discount_type || !discount_value || !valid_from || !valid_to) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        // Check if code already exists
        const existing = await db.query(
            'SELECT id FROM promo_codes WHERE code = $1',
            [code]
        );
        if (existing.rows.length > 0) {
            return res.status(400).json({ success: false, message: 'Promo code already exists' });
        }

        const insertQuery = await db.query(`
            INSERT INTO promo_codes (
                influencer_id, code, discount_type, discount_value,
                valid_from, valid_to, usage_limit, created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
            RETURNING *
        `, [
            req.influencerId,
            code,
            discount_type,
            discount_value,
            valid_from,
            valid_to,
            usage_limit || null
        ]);

        res.status(201).json({
            success: true,
            message: 'Promo code created successfully',
            data: insertQuery.rows[0]
        });

    } catch (error) {
        console.error('Error creating promo code:', error);
        res.status(500).json({ success: false, message: 'Failed to create promo code' });
    }
});

// Get all promo codes for the authenticated influencer
router.get('/my-codes', authorizeInfluencer, async (req, res) => {
    try {
        const codesQuery = await db.query(`
            SELECT * FROM promo_codes
            WHERE influencer_id = $1
            ORDER BY created_at DESC
        `, [req.influencerId]);

        res.json({
            success: true,
            data: codesQuery.rows
        });

    } catch (error) {
        console.error('Error fetching promo codes:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch promo codes' });
    }
});

// Get stats for influencer dashboard
router.get('/stats', authorizeInfluencer, async (req, res) => {
    try {
        // Total earnings
        const earningsQuery = await db.query(`
            SELECT COALESCE(SUM(influencer_commission), 0) as total_earnings
            FROM bookings
            WHERE promo_code_id IN (
                SELECT id FROM promo_codes WHERE influencer_id = $1
            ) AND status != 'cancelled'
        `, [req.influencerId]);

        // Total bookings using any of their codes
        const bookingsQuery = await db.query(`
            SELECT COUNT(*) as total_bookings
            FROM bookings
            WHERE promo_code_id IN (
                SELECT id FROM promo_codes WHERE influencer_id = $1
            ) AND status != 'cancelled'
        `, [req.influencerId]);

        // Top performing codes
        const topCodesQuery = await db.query(`
            SELECT 
                pc.code,
                COUNT(b.id) as bookings_count,
                COALESCE(SUM(b.influencer_commission), 0) as earnings
            FROM promo_codes pc
            LEFT JOIN bookings b ON pc.id = b.promo_code_id AND b.status != 'cancelled'
            WHERE pc.influencer_id = $1
            GROUP BY pc.id, pc.code
            ORDER BY earnings DESC
            LIMIT 5
        `, [req.influencerId]);

        res.json({
            success: true,
            data: {
                total_earnings: parseFloat(earningsQuery.rows[0].total_earnings),
                total_bookings: parseInt(bookingsQuery.rows[0].total_bookings),
                top_codes: topCodesQuery.rows
            }
        });

    } catch (error) {
        console.error('Error fetching influencer stats:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch stats' });
    }
});

module.exports = router;