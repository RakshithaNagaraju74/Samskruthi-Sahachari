const express = require('express');
const router = express.Router();
const db = require('../config/database'); // 👈 make sure this path is correct
const { authMiddleware } = require('../middlewares/authMiddleware');

router.use(authMiddleware);

// Helper to get influencer ID
const authorizeInfluencer = async (req, res, next) => {
  try {
    const result = await db.query('SELECT id FROM influencers WHERE user_id = $1', [req.user.id]);
    if (result.rows.length === 0) {
      return res.status(403).json({ success: false, message: 'Not an influencer' });
    }
    req.influencerId = result.rows[0].id;
    next();
  } catch (error) {
    console.error('Error in authorizeInfluencer:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /stats – fixed version
router.get('/stats', authorizeInfluencer, async (req, res) => {
  try {
    // Total earnings and bookings from all promo codes of this influencer
    const earningsQuery = await db.query(`
      SELECT 
        COALESCE(SUM(b.influencer_commission), 0) as total_earnings,
        COUNT(DISTINCT b.id) as total_bookings
      FROM bookings b
      JOIN promo_codes pc ON b.promo_code_id = pc.id
      WHERE pc.influencer_id = $1 AND b.status != 'cancelled'
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

    const result = {
      total_earnings: parseFloat(earningsQuery.rows[0].total_earnings),
      total_bookings: parseInt(earningsQuery.rows[0].total_bookings),
      top_codes: topCodesQuery.rows
    };

    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error fetching influencer stats:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch stats' });
  }
});

// POST /register (optional)
router.post('/register', async (req, res) => {
  try {
    const { commission_rate, bio, social_links } = req.body;
    const userId = req.user.id;

    const existing = await db.query('SELECT id FROM influencers WHERE user_id = $1', [userId]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'Already an influencer' });
    }

    const insert = await db.query(
      `INSERT INTO influencers (user_id, commission_rate, bio, social_links, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW()) RETURNING id`,
      [userId, commission_rate || 5.0, bio, social_links ? JSON.stringify(social_links) : null]
    );

    res.status(201).json({ success: true, data: { id: insert.rows[0].id } });
  } catch (error) {
    console.error('Error registering influencer:', error);
    res.status(500).json({ success: false, message: 'Failed to register' });
  }
});

// GET /profile
router.get('/profile', authorizeInfluencer, async (req, res) => {
  try {
    const profile = await db.query(
      `SELECT i.*, u.email, u.full_name 
       FROM influencers i 
       JOIN users u ON i.user_id = u.id 
       WHERE i.id = $1`,
      [req.influencerId]
    );
    res.json({ success: true, data: profile.rows[0] });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch profile' });
  }
});

module.exports = router;