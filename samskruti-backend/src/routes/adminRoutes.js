const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authMiddleware, authorize } = require('../middlewares/authMiddleware');

// All admin routes require authentication and admin role
router.use(authMiddleware);
router.use(authorize('admin'));

// Dashboard Statistics
router.get('/dashboard/stats', async (req, res) => {
    try {
        console.log('Fetching admin dashboard stats...');
        console.log('Admin user:', req.user);

        // Get pending enterprises count - using correct column names
        const pendingEnterprisesQuery = await db.query(
            `SELECT COUNT(*) FROM enterprises WHERE verification_status = 'pending' OR verification_status IS NULL`
        );
        console.log('Pending enterprises query result:', pendingEnterprisesQuery.rows);

        // Get pending sellers count
        const pendingSellersQuery = await db.query(
            `SELECT COUNT(*) FROM sellers WHERE verification_status = 'pending' OR verification_status IS NULL`
        );
        console.log('Pending sellers query result:', pendingSellersQuery.rows);

        // Get total users count (excluding admins)
        const totalUsersQuery = await db.query(
            `SELECT COUNT(*) FROM users WHERE role = 'user' OR role IS NULL`
        );
        console.log('Total users query result:', totalUsersQuery.rows);

        // Check if bookings table exists
        let totalBookings = 0;
        try {
            const bookingsQuery = await db.query(
                `SELECT COUNT(*) FROM bookings`
            );
            totalBookings = parseInt(bookingsQuery.rows[0].count);
            console.log('Total bookings:', totalBookings);
        } catch (bookingsError) {
            console.log('Bookings table may not exist:', bookingsError.message);
        }

        // Get recent activity from enterprises and sellers - FIXED column names
        const recentActivityQuery = await db.query(`
            SELECT 
                'enterprise' as type,
                enterprise_name as name,  -- Changed from company_name to enterprise_name
                verification_status as status,
                created_at
            FROM enterprises
            WHERE created_at >= NOW() - INTERVAL '30 days'
            
            UNION ALL
            
            SELECT 
                'seller' as type,
                shop_name as name,
                verification_status as status,
                created_at
            FROM sellers
            WHERE created_at >= NOW() - INTERVAL '30 days'
            
            ORDER BY created_at DESC
            LIMIT 10
        `);
        console.log('Recent activity:', recentActivityQuery.rows);

        const stats = {
            pendingEnterprises: parseInt(pendingEnterprisesQuery.rows[0].count),
            pendingSellers: parseInt(pendingSellersQuery.rows[0].count),
            totalUsers: parseInt(totalUsersQuery.rows[0].count),
            totalBookings: totalBookings,
            recentActivity: recentActivityQuery.rows
        };

        console.log('Final stats:', stats);

        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch dashboard stats',
            error: error.message,
            stack: error.stack
        });
    }
});

// Get all pending enterprises
router.get('/enterprises/pending', async (req, res) => {
    try {
        console.log('Fetching pending enterprises...');
        
        const query = `
            SELECT 
                e.*, 
                u.email, 
                u.created_at as user_created_at,
                u.is_active
            FROM enterprises e
            LEFT JOIN users u ON e.user_id = u.id
            WHERE e.verification_status = 'pending' OR e.verification_status IS NULL
            ORDER BY e.created_at ASC
        `;
        
        const result = await db.query(query);
        console.log(`Found ${result.rows.length} pending enterprises`);
        
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
        console.log('Fetching pending sellers...');
        
        const query = `
            SELECT 
                s.*, 
                u.email, 
                u.created_at as user_created_at,
                u.is_active
            FROM sellers s
            LEFT JOIN users u ON s.user_id = u.id
            WHERE s.verification_status = 'pending' OR s.verification_status IS NULL
            ORDER BY s.created_at ASC
        `;
        
        const result = await db.query(query);
        console.log(`Found ${result.rows.length} pending sellers`);
        
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

// Get single enterprise details
router.get('/enterprises/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`Fetching enterprise details for ID: ${id}`);
        
        const query = `
            SELECT 
                e.*, 
                u.email, 
                u.created_at as user_created_at,
                u.is_active,
                u.last_login
            FROM enterprises e
            LEFT JOIN users u ON e.user_id = u.id
            WHERE e.id = $1
        `;
        
        const result = await db.query(query, [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Enterprise not found'
            });
        }
        
        // Parse JSON fields if they exist
        const enterprise = result.rows[0];
        if (enterprise.documents && typeof enterprise.documents === 'string') {
            try {
                enterprise.documents = JSON.parse(enterprise.documents);
            } catch (e) {
                console.log('Documents is not valid JSON');
            }
        }
        
        console.log('Enterprise found:', enterprise.enterprise_name);
        
        res.json({
            success: true,
            data: enterprise
        });
    } catch (error) {
        console.error('Error fetching enterprise:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch enterprise',
            error: error.message
        });
    }
});

// Get single seller details
router.get('/sellers/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`Fetching seller details for ID: ${id}`);
        
        const query = `
            SELECT 
                s.*, 
                u.email, 
                u.created_at as user_created_at,
                u.is_active,
                u.last_login
            FROM sellers s
            LEFT JOIN users u ON s.user_id = u.id
            WHERE s.id = $1
        `;
        
        const result = await db.query(query, [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Seller not found'
            });
        }
        
        // Parse array fields if they exist
        const seller = result.rows[0];
        if (seller.product_categories && typeof seller.product_categories === 'string') {
            try {
                seller.product_categories = JSON.parse(seller.product_categories);
            } catch (e) {
                console.log('product_categories is not valid JSON');
            }
        }
        
        if (seller.verification_documents && typeof seller.verification_documents === 'string') {
            try {
                seller.verification_documents = JSON.parse(seller.verification_documents);
            } catch (e) {
                console.log('verification_documents is not valid JSON');
            }
        }
        
        console.log('Seller found:', seller.shop_name);
        
        res.json({
            success: true,
            data: seller
        });
    } catch (error) {
        console.error('Error fetching seller:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch seller',
            error: error.message
        });
    }
});

// Verify enterprise
router.post('/enterprises/:id/verify', async (req, res) => {
    const client = await db.pool.connect();
    
    try {
        await client.query('BEGIN');
        
        const { id } = req.params;
        const { status, rejectionReason, notes } = req.body;
        
        console.log(`Verifying enterprise ${id} with status: ${status}`);
        
        // Update enterprise
        const enterpriseQuery = `
            UPDATE enterprises 
            SET verification_status = $1, 
                verified_at = NOW(), 
                rejection_reason = $2,
                verified_by = $3,
                updated_at = NOW()
            WHERE id = $4
            RETURNING *
        `;
        
        const enterpriseResult = await client.query(enterpriseQuery, [status, rejectionReason, req.user.id, id]);
        
        if (enterpriseResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({
                success: false,
                message: 'Enterprise not found'
            });
        }
        
        const enterprise = enterpriseResult.rows[0];
        
        // If approved, update user verification status
        if (status === 'approved') {
            await client.query(
                'UPDATE users SET is_verified = true, updated_at = NOW() WHERE id = $1',
                [enterprise.user_id]
            );
        }
        
        await client.query('COMMIT');
        
        console.log(`Enterprise ${id} verified successfully`);
        
        res.json({
            success: true,
            message: `Enterprise ${status === 'approved' ? 'approved' : 'rejected'} successfully`,
            data: enterprise
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error verifying enterprise:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to verify enterprise',
            error: error.message
        });
    } finally {
        client.release();
    }
});

// Verify seller
router.post('/sellers/:id/verify', async (req, res) => {
    const client = await db.pool.connect();
    
    try {
        await client.query('BEGIN');
        
        const { id } = req.params;
        const { status, rejectionReason, notes } = req.body;
        
        console.log(`Verifying seller ${id} with status: ${status}`);
        
        // Update seller
        const sellerQuery = `
            UPDATE sellers 
            SET verification_status = $1, 
                verified_at = NOW(), 
                rejection_reason = $2,
                verified_by = $3,
                updated_at = NOW()
            WHERE id = $4
            RETURNING *
        `;
        
        const sellerResult = await client.query(sellerQuery, [status, rejectionReason, req.user.id, id]);
        
        if (sellerResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({
                success: false,
                message: 'Seller not found'
            });
        }
        
        const seller = sellerResult.rows[0];
        
        // If approved, update user verification status
        if (status === 'approved') {
            await client.query(
                'UPDATE users SET is_verified = true, updated_at = NOW() WHERE id = $1',
                [seller.user_id]
            );
        }
        
        await client.query('COMMIT');
        
        console.log(`Seller ${id} verified successfully`);
        
        res.json({
            success: true,
            message: `Seller ${status === 'approved' ? 'approved' : 'rejected'} successfully`,
            data: seller
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error verifying seller:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to verify seller',
            error: error.message
        });
    } finally {
        client.release();
    }
});
// Get single enterprise details
router.get('/enterprises/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`Fetching enterprise details for ID: ${id}`);
        
        const query = `
            SELECT 
                e.*, 
                u.email, 
                u.created_at as user_created_at,
                u.is_active,
                u.last_login
            FROM enterprises e
            LEFT JOIN users u ON e.user_id = u.id
            WHERE e.id = $1
        `;
        
        const result = await db.query(query, [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Enterprise not found'
            });
        }
        
        // Parse JSON fields
        const enterprise = result.rows[0];
        if (enterprise.verification_documents && typeof enterprise.verification_documents === 'string') {
            try {
                enterprise.verification_documents = JSON.parse(enterprise.verification_documents);
            } catch (e) {
                console.log('verification_documents is not valid JSON');
            }
        }
        if (enterprise.business_documents && typeof enterprise.business_documents === 'string') {
            try {
                enterprise.business_documents = JSON.parse(enterprise.business_documents);
            } catch (e) {
                console.log('business_documents is not valid JSON');
            }
        }
        if (enterprise.tax_documents && typeof enterprise.tax_documents === 'string') {
            try {
                enterprise.tax_documents = JSON.parse(enterprise.tax_documents);
            } catch (e) {
                console.log('tax_documents is not valid JSON');
            }
        }
        if (enterprise.bank_details && typeof enterprise.bank_details === 'string') {
            try {
                enterprise.bank_details = JSON.parse(enterprise.bank_details);
            } catch (e) {
                console.log('bank_details is not valid JSON');
            }
        }
        
        console.log('Enterprise found:', enterprise.enterprise_name);
        
        res.json({
            success: true,
            data: enterprise
        });
    } catch (error) {
        console.error('Error fetching enterprise:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch enterprise',
            error: error.message
        });
    }
});
module.exports = router;