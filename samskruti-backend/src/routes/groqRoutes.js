// routes/groqRoutes.js
const express = require('express');
const router = express.Router();
const groqService = require('../services/groqService');
const { authMiddleware } = require('../middlewares/authMiddleware');
const db = require('../config/database');

// Chat with AI assistant
router.post('/chat', authMiddleware, async (req, res) => {
    try {
        const { message } = req.body;
        
        if (!message) {
            return res.status(400).json({
                success: false,
                message: 'Message is required'
            });
        }

        // Get user's context data
        const sitesQuery = await db.query(`
            SELECT * FROM heritage_sites WHERE is_active = true LIMIT 20
        `);

        const ticketsQuery = await db.query(`
            SELECT t.*, hs.name as site_name
            FROM tickets t
            JOIN heritage_sites hs ON t.site_id = hs.id
            WHERE t.user_id = $1
            ORDER BY t.expires_at ASC
        `, [req.user.id]);

        const userContext = {
            sites: sitesQuery.rows,
            tickets: ticketsQuery.rows
        };

        const response = await groqService.chat(message, userContext);

        res.json(response);
    } catch (error) {
        console.error('Error in chat:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to process chat message'
        });
    }
});

// Get site recommendations
router.get('/recommendations', authMiddleware, async (req, res) => {
    try {
        const { category } = req.query;
        
        const recommendations = await groqService.getSiteRecommendations(req.user.id, { category });

        res.json(recommendations);
    } catch (error) {
        console.error('Error getting recommendations:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get recommendations'
        });
    }
});

module.exports = router;