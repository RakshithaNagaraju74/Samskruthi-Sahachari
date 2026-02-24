// routes/enterpriseRoutes.js
const express = require('express');
const router = express.Router();
const Enterprise = require('../models/Enterprise');
const HeritageSite = require('../models/HeritageSite');
const Booking = require('../models/Booking');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { checkUserType } = require('../middlewares/checkUserType');

// ============================================
// PUBLIC ENTERPRISE ROUTES
// ============================================

// Get all verified enterprises
router.get('/verified', async (req, res) => {
    try {
        const enterprises = await Enterprise.getAllVerified();
        
        res.json({
            success: true,
            data: enterprises,
            count: enterprises.length
        });
    } catch (error) {
        console.error('Error fetching verified enterprises:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch enterprises',
            error: error.message
        });
    }
});

// Get enterprise by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const enterprise = await Enterprise.findById(id);
        
        if (!enterprise) {
            return res.status(404).json({
                success: false,
                message: 'Enterprise not found'
            });
        }
        
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

// Get enterprise's heritage sites
router.get('/:id/sites', async (req, res) => {
    try {
        const { id } = req.params;
        const sites = await Enterprise.getHeritageSites(id);
        
        res.json({
            success: true,
            data: sites,
            count: sites.length
        });
    } catch (error) {
        console.error('Error fetching enterprise sites:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch enterprise sites',
            error: error.message
        });
    }
});

// ============================================
// ENTERPRISE PROFILE ROUTES (Protected)
// ============================================

// Get current enterprise profile
router.get('/profile/me', authMiddleware, checkUserType(['enterprise']), async (req, res) => {
    try {
        const enterprise = await Enterprise.findByUserId(req.user.id);
        
        if (!enterprise) {
            return res.status(404).json({
                success: false,
                message: 'Enterprise profile not found'
            });
        }
        
        res.json({
            success: true,
            data: enterprise
        });
    } catch (error) {
        console.error('Error fetching enterprise profile:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch enterprise profile',
            error: error.message
        });
    }
});

// Create enterprise profile
router.post('/profile', authMiddleware, checkUserType(['enterprise']), async (req, res) => {
    try {
        // Check if profile already exists
        const existingProfile = await Enterprise.findByUserId(req.user.id);
        if (existingProfile) {
            return res.status(400).json({
                success: false,
                message: 'Enterprise profile already exists'
            });
        }
        
        const {
            company_name,
            registration_number,
            gst_number,
            contact_person,
            contact_email,
            contact_phone,
            address,
            city,
            state,
            pincode,
            website,
            description,
            logo_url
        } = req.body;
        
        // Validate required fields
        if (!company_name || !registration_number || !contact_person || !contact_email || !contact_phone) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: company_name, registration_number, contact_person, contact_email, contact_phone'
            });
        }
        
        const enterprise = await Enterprise.create({
            user_id: req.user.id,
            company_name,
            registration_number,
            gst_number,
            contact_person,
            contact_email,
            contact_phone,
            address,
            city,
            state,
            pincode,
            website,
            description,
            logo_url
        });
        
        res.status(201).json({
            success: true,
            message: 'Enterprise profile created successfully',
            data: enterprise
        });
    } catch (error) {
        console.error('Error creating enterprise profile:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create enterprise profile',
            error: error.message
        });
    }
});

// Update enterprise profile
router.put('/profile', authMiddleware, checkUserType(['enterprise']), async (req, res) => {
    try {
        const enterprise = await Enterprise.update(req.user.id, req.body);
        
        if (!enterprise) {
            return res.status(404).json({
                success: false,
                message: 'Enterprise profile not found or no fields to update'
            });
        }
        
        res.json({
            success: true,
            message: 'Enterprise profile updated successfully',
            data: enterprise
        });
    } catch (error) {
        console.error('Error updating enterprise profile:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update enterprise profile',
            error: error.message
        });
    }
});

// ============================================
// ENTERPRISE SITE MANAGEMENT ROUTES
// ============================================

// Get enterprise's own heritage sites
router.get('/my-sites', authMiddleware, checkUserType(['enterprise']), async (req, res) => {
    try {
        const enterprise = await Enterprise.findByUserId(req.user.id);
        
        if (!enterprise) {
            return res.status(404).json({
                success: false,
                message: 'Enterprise profile not found'
            });
        }
        
        const sites = await Enterprise.getHeritageSites(enterprise.id);
        
        res.json({
            success: true,
            data: sites,
            count: sites.length
        });
    } catch (error) {
        console.error('Error fetching enterprise sites:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch enterprise sites',
            error: error.message
        });
    }
});

// Create a new heritage site (for enterprise)
router.post('/sites', authMiddleware, checkUserType(['enterprise']), async (req, res) => {
    try {
        const enterprise = await Enterprise.findByUserId(req.user.id);
        
        if (!enterprise) {
            return res.status(404).json({
                success: false,
                message: 'Enterprise profile not found'
            });
        }
        
        // Add enterprise_id to the site data
        const siteData = {
            ...req.body,
            enterprise_id: enterprise.id,
            is_active: false // New sites need approval
        };
        
        // This would use a method from HeritageSite model
        // For now, we'll use a direct query
        const db = require('../config/database');
        const query = `
            INSERT INTO heritage_sites (
                name, description, short_description, location, district,
                category, subcategory, site_type, main_image, gallery_images,
                entry_fee_indian, entry_fee_foreigner, opening_time, closing_time,
                best_time_to_visit, duration_required, built_by, built_in,
                architectural_style, significance, tags, highlights,
                contact_phone, contact_email, website, enterprise_id,
                is_active, created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14,
                     $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, NOW(), NOW())
            RETURNING *
        `;
        
        const values = [
            siteData.name,
            siteData.description,
            siteData.short_description || null,
            siteData.location,
            siteData.district || null,
            siteData.category,
            siteData.subcategory || null,
            siteData.site_type || null,
            siteData.main_image || null,
            siteData.gallery_images || [],
            siteData.entry_fee_indian || 0,
            siteData.entry_fee_foreigner || 0,
            siteData.opening_time || null,
            siteData.closing_time || null,
            siteData.best_time_to_visit || null,
            siteData.duration_required || null,
            siteData.built_by || null,
            siteData.built_in || null,
            siteData.architectural_style || null,
            siteData.significance || null,
            siteData.tags || [],
            siteData.highlights || [],
            siteData.contact_phone || null,
            siteData.contact_email || null,
            siteData.website || null,
            enterprise.id,
            false // is_active = false (pending approval)
        ];
        
        const result = await db.query(query, values);
        
        res.status(201).json({
            success: true,
            message: 'Heritage site created successfully. Pending approval.',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error creating heritage site:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create heritage site',
            error: error.message
        });
    }
});

// Update enterprise's heritage site
router.put('/sites/:siteId', authMiddleware, checkUserType(['enterprise']), async (req, res) => {
    try {
        const { siteId } = req.params;
        const enterprise = await Enterprise.findByUserId(req.user.id);
        
        if (!enterprise) {
            return res.status(404).json({
                success: false,
                message: 'Enterprise profile not found'
            });
        }
        
        // Check if site belongs to enterprise
        const db = require('../config/database');
        const checkQuery = 'SELECT * FROM heritage_sites WHERE id = $1 AND enterprise_id = $2';
        const checkResult = await db.query(checkQuery, [siteId, enterprise.id]);
        
        if (checkResult.rows.length === 0) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized to update this site'
            });
        }
        
        // Build update query dynamically
        const allowedFields = [
            'name', 'description', 'short_description', 'location', 'district',
            'category', 'subcategory', 'site_type', 'main_image', 'gallery_images',
            'entry_fee_indian', 'entry_fee_foreigner', 'opening_time', 'closing_time',
            'best_time_to_visit', 'duration_required', 'built_by', 'built_in',
            'architectural_style', 'significance', 'tags', 'highlights',
            'contact_phone', 'contact_email', 'website'
        ];
        
        const updates = [];
        const values = [];
        let paramIndex = 1;
        
        Object.keys(req.body).forEach(key => {
            if (allowedFields.includes(key) && req.body[key] !== undefined) {
                updates.push(`${key} = $${paramIndex}`);
                values.push(req.body[key]);
                paramIndex++;
            }
        });
        
        if (updates.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No valid fields to update'
            });
        }
        
        values.push(siteId);
        const updateQuery = `
            UPDATE heritage_sites 
            SET ${updates.join(', ')}, updated_at = NOW()
            WHERE id = $${paramIndex}
            RETURNING *
        `;
        
        const result = await db.query(updateQuery, values);
        
        res.json({
            success: true,
            message: 'Heritage site updated successfully',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error updating heritage site:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update heritage site',
            error: error.message
        });
    }
});

// Delete enterprise's heritage site
router.delete('/sites/:siteId', authMiddleware, checkUserType(['enterprise']), async (req, res) => {
    try {
        const { siteId } = req.params;
        const enterprise = await Enterprise.findByUserId(req.user.id);
        
        if (!enterprise) {
            return res.status(404).json({
                success: false,
                message: 'Enterprise profile not found'
            });
        }
        
        // Check if site belongs to enterprise
        const db = require('../config/database');
        const checkQuery = 'SELECT * FROM heritage_sites WHERE id = $1 AND enterprise_id = $2';
        const checkResult = await db.query(checkQuery, [siteId, enterprise.id]);
        
        if (checkResult.rows.length === 0) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized to delete this site'
            });
        }
        
        // Soft delete (set is_active to false)
        const deleteQuery = 'UPDATE heritage_sites SET is_active = false, updated_at = NOW() WHERE id = $1 RETURNING *';
        const result = await db.query(deleteQuery, [siteId]);
        
        res.json({
            success: true,
            message: 'Heritage site deleted successfully',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error deleting heritage site:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete heritage site',
            error: error.message
        });
    }
});

// ============================================
// ENTERPRISE BOOKING MANAGEMENT
// ============================================

// Get bookings for enterprise's sites
router.get('/bookings', authMiddleware, checkUserType(['enterprise']), async (req, res) => {
    try {
        const enterprise = await Enterprise.findByUserId(req.user.id);
        
        if (!enterprise) {
            return res.status(404).json({
                success: false,
                message: 'Enterprise profile not found'
            });
        }
        
        const db = require('../config/database');
        const query = `
            SELECT b.*, 
                   hs.name as site_name,
                   u.email as user_email,
                   u.id as user_id
            FROM bookings b
            JOIN heritage_sites hs ON b.site_id = hs.id
            JOIN users u ON b.user_id = u.id
            WHERE hs.enterprise_id = $1
            ORDER BY b.travel_date DESC
        `;
        
        const result = await db.query(query, [enterprise.id]);
        
        res.json({
            success: true,
            data: result.rows,
            count: result.rows.length
        });
    } catch (error) {
        console.error('Error fetching enterprise bookings:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch bookings',
            error: error.message
        });
    }
});

// Get booking statistics for enterprise
router.get('/bookings/stats', authMiddleware, checkUserType(['enterprise']), async (req, res) => {
    try {
        const enterprise = await Enterprise.findByUserId(req.user.id);
        
        if (!enterprise) {
            return res.status(404).json({
                success: false,
                message: 'Enterprise profile not found'
            });
        }
        
        const db = require('../config/database');
        const query = `
            SELECT 
                COUNT(*) as total_bookings,
                COUNT(CASE WHEN b.status = 'confirmed' THEN 1 END) as confirmed_bookings,
                COUNT(CASE WHEN b.status = 'completed' THEN 1 END) as completed_bookings,
                COUNT(CASE WHEN b.status = 'cancelled' THEN 1 END) as cancelled_bookings,
                COUNT(CASE WHEN b.travel_date >= CURRENT_DATE THEN 1 END) as upcoming_bookings,
                SUM(b.total_amount) as total_revenue,
                AVG(b.total_amount) as average_booking_value
            FROM bookings b
            JOIN heritage_sites hs ON b.site_id = hs.id
            WHERE hs.enterprise_id = $1
        `;
        
        const result = await db.query(query, [enterprise.id]);
        
        res.json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error fetching booking stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch booking statistics',
            error: error.message
        });
    }
});

// ============================================
// ADMIN ROUTES FOR ENTERPRISE MANAGEMENT
// ============================================

// Verify enterprise (admin only)
router.put('/admin/:id/verify', authMiddleware, checkUserType(['admin']), async (req, res) => {
    try {
        const { id } = req.params;
        const enterprise = await Enterprise.verify(id);
        
        if (!enterprise) {
            return res.status(404).json({
                success: false,
                message: 'Enterprise not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Enterprise verified successfully',
            data: enterprise
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

// Get all enterprises (admin only)
router.get('/admin/all', authMiddleware, checkUserType(['admin']), async (req, res) => {
    try {
        const db = require('../config/database');
        const query = `
            SELECT e.*, u.email, u.created_at as user_created_at
            FROM enterprises e
            JOIN users u ON e.user_id = u.id
            ORDER BY e.created_at DESC
        `;
        
        const result = await db.query(query);
        
        res.json({
            success: true,
            data: result.rows,
            count: result.rows.length
        });
    } catch (error) {
        console.error('Error fetching all enterprises:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch enterprises',
            error: error.message
        });
    }
});

// Get pending enterprises (admin only)
router.get('/admin/pending', authMiddleware, checkUserType(['admin']), async (req, res) => {
    try {
        const db = require('../config/database');
        const query = `
            SELECT e.*, u.email, u.created_at as user_created_at
            FROM enterprises e
            JOIN users u ON e.user_id = u.id
            WHERE e.verified = false
            ORDER BY e.created_at ASC
        `;
        
        const result = await db.query(query);
        
        res.json({
            success: true,
            data: result.rows,
            count: result.rows.length
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

// Update enterprise rating (triggered by reviews)
router.post('/:id/update-rating', async (req, res) => {
    try {
        const { id } = req.params;
        const enterprise = await Enterprise.updateRating(id);
        
        res.json({
            success: true,
            message: 'Enterprise rating updated',
            data: enterprise
        });
    } catch (error) {
        console.error('Error updating enterprise rating:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update enterprise rating',
            error: error.message
        });
    }
});

module.exports = router;