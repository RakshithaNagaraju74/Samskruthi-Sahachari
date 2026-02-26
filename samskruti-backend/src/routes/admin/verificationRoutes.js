const express = require('express');
const router = express.Router();
const db = require('../../config/database');

// Get all pending enterprises
router.get('/enterprises/pending', async (req, res) => {
    try {
        const query = `
            SELECT e.*, u.email, u.created_at as user_created_at
            FROM enterprises e
            JOIN users u ON e.user_id = u.id
            WHERE e.verification_status = 'pending' OR e.verification_status IS NULL
            ORDER BY e.created_at ASC
        `;
        const result = await db.query(query);
        
        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Error fetching pending enterprises:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch pending enterprises',
            error: error.message
        });
    }
});

// Get all pending sellers
router.get('/sellers/pending', async (req, res) => {
    try {
        const query = `
            SELECT s.*, u.email, u.created_at as user_created_at
            FROM sellers s
            JOIN users u ON s.user_id = u.id
            WHERE s.verification_status = 'pending' OR s.verification_status IS NULL
            ORDER BY s.created_at ASC
        `;
        const result = await db.query(query);
        
        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Error fetching pending sellers:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch pending sellers',
            error: error.message
        });
    }
});

// Verify enterprise
router.post('/enterprises/:id/verify', async (req, res) => {
    try {
        const { id } = req.params;
        const { status, rejectionReason } = req.body;
        
        const query = `
            UPDATE enterprises 
            SET verification_status = $1, 
                verified_at = NOW(), 
                rejection_reason = $2,
                updated_at = NOW()
            WHERE id = $3
            RETURNING *
        `;
        
        const result = await db.query(query, [status, rejectionReason, id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Enterprise not found'
            });
        }
        
        res.json({
            success: true,
            message: `Enterprise ${status === 'approved' ? 'approved' : 'rejected'} successfully`,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error verifying enterprise:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to verify enterprise',
            error: error.message
        });
    }
});

// Verify seller
router.post('/sellers/:id/verify', async (req, res) => {
    try {
        const { id } = req.params;
        const { status, rejectionReason } = req.body;
        
        const query = `
            UPDATE sellers 
            SET verification_status = $1, 
                verified_at = NOW(), 
                rejection_reason = $2,
                updated_at = NOW()
            WHERE id = $3
            RETURNING *
        `;
        
        const result = await db.query(query, [status, rejectionReason, id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Seller not found'
            });
        }
        
        res.json({
            success: true,
            message: `Seller ${status === 'approved' ? 'approved' : 'rejected'} successfully`,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error verifying seller:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to verify seller',
            error: error.message
        });
    }
});

module.exports = router;