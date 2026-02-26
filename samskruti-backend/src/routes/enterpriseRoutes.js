const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authMiddleware, authorize } = require('../middlewares/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Debug endpoint
router.get('/debug', (req, res) => {
    res.json({
        success: true,
        message: 'Enterprise routes debug endpoint',
        user: req.user,
        path: req.path,
        baseUrl: req.baseUrl,
        originalUrl: req.originalUrl
    });
});

// All enterprise routes require authentication and enterprise role
router.use(authMiddleware);
router.use(authorize('enterprise'));

// Configure multer for site image uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = 'uploads/sites';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'site-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    }
});

// ==================== DASHBOARD STATS ====================
router.get('/dashboard/stats', async (req, res) => {
    try {
        const enterpriseId = req.user.id;
        console.log('📊 ===== START FETCHING ENTERPRISE DASHBOARD STATS =====');
        console.log('📊 User ID from token:', enterpriseId);

        // Get enterprise profile to get enterprise_id
        const enterpriseQuery = await db.query(
            'SELECT id FROM enterprises WHERE user_id = $1',
            [enterpriseId]
        );
        
        if (enterpriseQuery.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Enterprise profile not found'
            });
        }
        
        const enterpriseRecordId = enterpriseQuery.rows[0].id;
        console.log('✅ Found enterprise record ID:', enterpriseRecordId);

        // Get total sites
        const totalSitesQuery = await db.query(
            'SELECT COUNT(*) FROM heritage_sites WHERE enterprise_id = $1',
            [enterpriseRecordId]
        );
        console.log('📊 Total sites result:', totalSitesQuery.rows[0]);

        // Since there's no is_approved column, we'll use is_active and is_featured as indicators
        // You might need to adjust this based on how you track approval in your system
        const approvedSitesQuery = await db.query(
            "SELECT COUNT(*) FROM heritage_sites WHERE enterprise_id = $1 AND is_active = true",
            [enterpriseRecordId]
        );
        console.log('📊 Active sites result:', approvedSitesQuery.rows[0]);

        // Pending sites could be those that are not active or have some other status
        const pendingSitesQuery = await db.query(
            "SELECT COUNT(*) FROM heritage_sites WHERE enterprise_id = $1 AND (is_active = false OR is_active IS NULL)",
            [enterpriseRecordId]
        );
        console.log('📊 Inactive sites result:', pendingSitesQuery.rows[0]);

        // Get total bookings for enterprise sites
        let totalBookings = { count: 0, revenue: 0 };
        try {
            const totalBookingsQuery = await db.query(`
                SELECT COUNT(*) as count, COALESCE(SUM(b.total_amount), 0) as revenue
                FROM bookings b
                JOIN heritage_sites hs ON b.site_id = hs.id
                WHERE hs.enterprise_id = $1
            `, [enterpriseRecordId]);
            totalBookings = totalBookingsQuery.rows[0];
            console.log('📊 Total bookings:', totalBookings);
        } catch (bookingError) {
            console.log('📊 Bookings table might not exist:', bookingError.message);
        }

        // Get monthly revenue for last 6 months
        let monthlyRevenue = [];
        try {
            const monthlyRevenueQuery = await db.query(`
                SELECT 
                    TO_CHAR(DATE_TRUNC('month', b.created_at), 'Mon YYYY') as month,
                    COUNT(*) as bookings,
                    COALESCE(SUM(b.total_amount), 0) as revenue
                FROM bookings b
                JOIN heritage_sites hs ON b.site_id = hs.id
                WHERE hs.enterprise_id = $1 
                  AND b.created_at >= NOW() - INTERVAL '6 months'
                GROUP BY DATE_TRUNC('month', b.created_at)
                ORDER BY month DESC
            `, [enterpriseRecordId]);
            monthlyRevenue = monthlyRevenueQuery.rows;
            console.log('📊 Monthly revenue rows:', monthlyRevenue.length);
        } catch (bookingError) {
            console.log('📊 Monthly revenue query failed:', bookingError.message);
        }

        // Get recent bookings
        let recentBookings = [];
        try {
            const recentBookingsQuery = await db.query(`
                SELECT 
                    b.id,
                    b.booking_reference,
                    b.travel_date,
                    b.total_amount,
                    b.status,
                    b.created_at,
                    hs.name as site_name,
                    u.email as user_email
                FROM bookings b
                JOIN heritage_sites hs ON b.site_id = hs.id
                JOIN users u ON b.user_id = u.id
                WHERE hs.enterprise_id = $1
                ORDER BY b.created_at DESC
                LIMIT 10
            `, [enterpriseRecordId]);
            recentBookings = recentBookingsQuery.rows;
            console.log('📊 Recent bookings rows:', recentBookings.length);
        } catch (bookingError) {
            console.log('📊 Recent bookings query failed:', bookingError.message);
        }

        // Get popular sites
        let popularSites = [];
        try {
            const popularSitesQuery = await db.query(`
                SELECT 
                    hs.id,
                    hs.name,
                    hs.location,
                    hs.image as main_image,
                    hs.rating,
                    COUNT(b.id) as total_bookings,
                    COALESCE(SUM(b.total_amount), 0) as revenue
                FROM heritage_sites hs
                LEFT JOIN bookings b ON hs.id = b.site_id
                WHERE hs.enterprise_id = $1
                GROUP BY hs.id, hs.name, hs.location, hs.image, hs.rating
                ORDER BY total_bookings DESC
                LIMIT 5
            `, [enterpriseRecordId]);
            popularSites = popularSitesQuery.rows;
            console.log('📊 Popular sites rows:', popularSites.length);
        } catch (bookingError) {
            console.log('📊 Popular sites query failed:', bookingError.message);
        }

        // Get ticket usage stats
        let ticketStats = { total_tickets: 0, active_tickets: 0, used_tickets: 0, expired_tickets: 0 };
        try {
            const ticketStatsQuery = await db.query(`
                SELECT 
                    COUNT(*) as total_tickets,
                    COUNT(CASE WHEN status = 'active' THEN 1 END) as active_tickets,
                    COUNT(CASE WHEN status = 'used' THEN 1 END) as used_tickets,
                    COUNT(CASE WHEN status = 'expired' THEN 1 END) as expired_tickets
                FROM tickets t
                JOIN heritage_sites hs ON t.site_id = hs.id
                WHERE hs.enterprise_id = $1
            `, [enterpriseRecordId]);
            ticketStats = ticketStatsQuery.rows[0] || ticketStats;
            console.log('📊 Ticket stats:', ticketStats);
        } catch (ticketError) {
            console.log('📊 Tickets table might not exist:', ticketError.message);
        }

        console.log('📊 ===== SUCCESS: Preparing response =====');
        
        const responseData = {
            sites: {
                total: parseInt(totalSitesQuery.rows[0].count),
                approved: parseInt(approvedSitesQuery.rows[0].count),
                pending: parseInt(pendingSitesQuery.rows[0].count)
            },
            bookings: {
                total: parseInt(totalBookings.count),
                revenue: parseFloat(totalBookings.revenue)
            },
            monthlyRevenue: monthlyRevenue,
            recentBookings: recentBookings,
            popularSites: popularSites,
            tickets: ticketStats
        };

        console.log('📊 Response data:', JSON.stringify(responseData, null, 2));

        res.json({
            success: true,
            data: responseData
        });

    } catch (error) {
        console.error('❌ Error fetching enterprise stats:', error);
        console.error('❌ Error code:', error.code);
        console.error('❌ Error position:', error.position);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch dashboard stats',
            error: error.message
        });
    }
});

// ==================== SITE MANAGEMENT ====================

// Get all sites for enterprise
// Get all sites for enterprise - UPDATED with correct column names
// Get all sites for enterprise - FIXED array parsing
// Get all sites for enterprise
router.get('/sites', async (req, res) => {
    try {
        const enterpriseId = req.user.id;
        
        // Get enterprise verification status
        const enterpriseQuery = await db.query(
            'SELECT id, verification_status FROM enterprises WHERE user_id = $1',
            [enterpriseId]
        );
        
        if (enterpriseQuery.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Enterprise profile not found'
            });
        }
        
        const enterpriseRecordId = enterpriseQuery.rows[0].id;
        const verificationStatus = enterpriseQuery.rows[0].verification_status;
        
        console.log('Enterprise verification status:', verificationStatus);

        const sitesQuery = await db.query(`
            SELECT 
                id,
                name,
                location,
                district,
                state,
                description,
                short_description,
                category,
                subcategory,
                site_type,
                built_in,
                built_by,
                architectural_style,
                significance,
                entry_fee_indian,
                entry_fee_foreigner,
                opening_time,
                closing_time,
                best_time_to_visit,
                duration_required,
                contact_phone,
                contact_email,
                website,
                main_image as image,
                gallery_images,
                is_active,
                is_featured,
                is_unesco,
                rating,
                total_reviews,
                views,
                tags,
                highlights,
                created_at
            FROM heritage_sites
            WHERE enterprise_id = $1
            ORDER BY created_at DESC
        `, [enterpriseRecordId]);

        // Parse array fields from PostgreSQL format to JavaScript arrays
        const sites = sitesQuery.rows.map(site => {
            // Parse gallery_images
            if (site.gallery_images) {
                if (typeof site.gallery_images === 'string') {
                    const arrayStr = site.gallery_images.substring(1, site.gallery_images.length - 1);
                    site.gallery_images = arrayStr ? arrayStr.split(',').map(item => item.trim().replace(/^"|"$/g, '')) : [];
                }
            } else {
                site.gallery_images = [];
            }

            // Parse tags
            if (site.tags) {
                if (typeof site.tags === 'string') {
                    const arrayStr = site.tags.substring(1, site.tags.length - 1);
                    site.tags = arrayStr ? arrayStr.split(',').map(item => item.trim().replace(/^"|"$/g, '')) : [];
                }
            } else {
                site.tags = [];
            }

            // Parse highlights
            if (site.highlights) {
                if (typeof site.highlights === 'string') {
                    const arrayStr = site.highlights.substring(1, site.highlights.length - 1);
                    site.highlights = arrayStr ? arrayStr.split(',').map(item => item.trim().replace(/^"|"$/g, '')) : [];
                }
            } else {
                site.highlights = [];
            }

            return site;
        });

        res.json({
            success: true,
            data: sites,
            enterprise_status: verificationStatus
        });

    } catch (error) {
        console.error('Error fetching sites:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch sites',
            error: error.message
        });
    }
});

// Get single site details
// Get single site details - UPDATED with correct column names
router.get('/sites/:siteId', async (req, res) => {
    try {
        const { siteId } = req.params;
        const enterpriseId = req.user.id;
        
        const enterpriseQuery = await db.query(
            'SELECT id FROM enterprises WHERE user_id = $1',
            [enterpriseId]
        );
        
        if (enterpriseQuery.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Enterprise profile not found'
            });
        }
        
        const enterpriseRecordId = enterpriseQuery.rows[0].id;

        const siteQuery = await db.query(`
            SELECT * FROM heritage_sites
            WHERE id = $1 AND enterprise_id = $2
        `, [siteId, enterpriseRecordId]);

        if (siteQuery.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Site not found'
            });
        }

        // Get bookings for this site
        const bookingsQuery = await db.query(`
            SELECT 
                b.*,
                u.email as user_email
            FROM bookings b
            JOIN users u ON b.user_id = u.id
            WHERE b.site_id = $1
            ORDER BY b.created_at DESC
            LIMIT 20
        `, [siteId]);

        // Get reviews for this site
        const reviewsQuery = await db.query(`
            SELECT 
                r.*,
                u.email as user_email,
                u.full_name
            FROM reviews r
            JOIN users u ON r.user_id = u.id
            WHERE r.site_id = $1
            ORDER BY r.created_at DESC
        `, [siteId]);

        const site = siteQuery.rows[0];
        
        // Parse JSON fields
        if (site.gallery_images && typeof site.gallery_images === 'string') {
            try {
                site.gallery_images = JSON.parse(site.gallery_images);
            } catch (e) {
                site.gallery_images = [];
            }
        }
        if (site.tags && typeof site.tags === 'string') {
            try {
                site.tags = JSON.parse(site.tags);
            } catch (e) {
                site.tags = [];
            }
        }
        if (site.highlights && typeof site.highlights === 'string') {
            try {
                site.highlights = JSON.parse(site.highlights);
            } catch (e) {
                site.highlights = [];
            }
        }

        res.json({
            success: true,
            data: {
                ...site,
                bookings: bookingsQuery.rows,
                reviews: reviewsQuery.rows
            }
        });

    } catch (error) {
        console.error('Error fetching site:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch site details',
            error: error.message
        });
    }
});

// Create new site
// Create new site - UPDATED with correct column names
// Create new site - FIXED array formatting
// Create new site - FIXED: Remove id from insert
// Create new site - with automatic approval for verified enterprises
router.post('/sites', upload.array('images', 10), async (req, res) => {
    const client = await db.pool.connect();
    
    try {
        await client.query('BEGIN');
        
        const enterpriseId = req.user.id;
        console.log('Creating site for enterprise user:', enterpriseId);
        
        // Get enterprise profile details including verification status
        const enterpriseQuery = await client.query(
            'SELECT id, verification_status FROM enterprises WHERE user_id = $1',
            [enterpriseId]
        );
        
        if (enterpriseQuery.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({
                success: false,
                message: 'Enterprise profile not found'
            });
        }
        
        const enterpriseRecordId = enterpriseQuery.rows[0].id;
        const verificationStatus = enterpriseQuery.rows[0].verification_status;
        
        console.log('Enterprise record ID:', enterpriseRecordId);
        console.log('Enterprise verification status:', verificationStatus);

        // Determine if site should be auto-approved
        // If enterprise is verified, sites are automatically approved
        const isAutoApproved = verificationStatus === 'approved';
        
        console.log('Auto approve site?', isAutoApproved);

        const {
            name,
            location,
            district,
            state,
            description,
            short_description,
            category,
            subcategory,
            site_type,
            built_in,
            built_by,
            architectural_style,
            significance,
            entry_fee_indian,
            entry_fee_foreigner,
            opening_time,
            closing_time,
            best_time_to_visit,
            duration_required,
            contact_phone,
            contact_email,
            website,
            tags,
            highlights
        } = req.body;

        // Handle image uploads
        const images = req.files ? req.files.map(file => file.path) : [];
        const mainImage = images.length > 0 ? images[0] : null;

        // Format images as PostgreSQL array literal
        let imagesArray = '{}';
        if (images.length > 0) {
            imagesArray = '{' + images.map(img => `"${img.replace(/\\/g, '\\\\')}"`).join(',') + '}';
        }

        // Parse JSON fields for tags and highlights
        let tagsArray = '{}';
        if (tags) {
            try {
                const parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags;
                if (Array.isArray(parsedTags) && parsedTags.length > 0) {
                    tagsArray = '{' + parsedTags.map(tag => `"${tag}"`).join(',') + '}';
                }
            } catch (e) {
                console.log('Error parsing tags:', e);
            }
        }

        let highlightsArray = '{}';
        if (highlights) {
            try {
                const parsedHighlights = typeof highlights === 'string' ? JSON.parse(highlights) : highlights;
                if (Array.isArray(parsedHighlights) && parsedHighlights.length > 0) {
                    highlightsArray = '{' + parsedHighlights.map(h => `"${h}"`).join(',') + '}';
                }
            } catch (e) {
                console.log('Error parsing highlights:', e);
            }
        }

        console.log('Images array:', imagesArray);
        console.log('Tags array:', tagsArray);
        console.log('Highlights array:', highlightsArray);

        // For verified enterprises, sites are active immediately
        // For unverified enterprises, sites need approval
        const isActive = isAutoApproved ? true : false;

        const insertQuery = await client.query(`
            INSERT INTO heritage_sites (
                enterprise_id,
                name,
                location,
                district,
                state,
                description,
                short_description,
                category,
                subcategory,
                site_type,
                built_in,
                built_by,
                architectural_style,
                significance,
                entry_fee_indian,
                entry_fee_foreigner,
                opening_time,
                closing_time,
                best_time_to_visit,
                duration_required,
                contact_phone,
                contact_email,
                website,
                main_image,
                gallery_images,
                tags,
                highlights,
                is_active,
                views,
                rating,
                total_reviews,
                created_at,
                updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25::text[], $26::text[], $27::text[], $28, $29, $30, $31, NOW(), NOW())
            RETURNING id
        `, [
            enterpriseRecordId,
            name,
            location || null,
            district || null,
            state || null,
            description || null,
            short_description || null,
            category || null,
            subcategory || null,
            site_type || null,
            built_in || null,
            built_by || null,
            architectural_style || null,
            significance || null,
            entry_fee_indian ? parseFloat(entry_fee_indian) : null,
            entry_fee_foreigner ? parseFloat(entry_fee_foreigner) : null,
            opening_time || null,
            closing_time || null,
            best_time_to_visit || null,
            duration_required || null,
            contact_phone || null,
            contact_email || null,
            website || null,
            mainImage,
            imagesArray,
            tagsArray,
            highlightsArray,
            isActive, // Use the calculated value
            0, // views
            0, // rating
            0 // total_reviews
        ]);

        await client.query('COMMIT');

        const message = isAutoApproved 
            ? 'Site created successfully and is now live!' 
            : 'Site created successfully. Waiting for admin approval.';

        res.status(201).json({
            success: true,
            message,
            data: {
                id: insertQuery.rows[0].id,
                name,
                is_active: isActive
            }
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error creating site:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create site',
            error: error.message
        });
    } finally {
        client.release();
    }
});

// Update site
router.put('/sites/:siteId', upload.array('images', 10), async (req, res) => {
    const client = await db.pool.connect();
    
    try {
        await client.query('BEGIN');
        
        const { siteId } = req.params;
        const enterpriseId = req.user.id;
        
        const enterpriseQuery = await client.query(
            'SELECT id FROM enterprises WHERE user_id = $1',
            [enterpriseId]
        );
        
        if (enterpriseQuery.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({
                success: false,
                message: 'Enterprise profile not found'
            });
        }
        
        const enterpriseRecordId = enterpriseQuery.rows[0].id;

        // Check if site exists and belongs to enterprise
        const siteCheck = await client.query(
            'SELECT * FROM heritage_sites WHERE id = $1 AND enterprise_id = $2',
            [siteId, enterpriseRecordId]
        );

        if (siteCheck.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({
                success: false,
                message: 'Site not found or you do not have permission'
            });
        }

        const existingSite = siteCheck.rows[0];

        const {
            name,
            location,
            state,
            description,
            short_description,
            category,
            subcategory,
            price,
            entry_fee,
            duration,
            best_time,
            latitude,
            longitude,
            tags,
            highlights,
            open_timing,
            closed_on,
            contact_phone,
            contact_email,
            website
        } = req.body;

        // Handle image uploads
        let images = existingSite.images;
        if (existingSite.images) {
            if (typeof existingSite.images === 'string') {
                try {
                    images = JSON.parse(existingSite.images);
                } catch (e) {
                    images = [];
                }
            } else if (Array.isArray(existingSite.images)) {
                images = existingSite.images;
            }
        } else {
            images = [];
        }

        if (req.files && req.files.length > 0) {
            const newImages = req.files.map(file => file.path);
            images = [...images, ...newImages];
        }

        const mainImage = req.files && req.files.length > 0 ? req.files[0].path : existingSite.image;

        // Parse JSON fields
        let tagsArray = existingSite.tags;
        if (tags) {
            try {
                tagsArray = typeof tags === 'string' ? JSON.parse(tags) : tags;
            } catch (e) {
                tagsArray = existingSite.tags || [];
            }
        }

        let highlightsArray = existingSite.highlights;
        if (highlights) {
            try {
                highlightsArray = typeof highlights === 'string' ? JSON.parse(highlights) : highlights;
            } catch (e) {
                highlightsArray = existingSite.highlights || [];
            }
        }

        await client.query(`
            UPDATE heritage_sites SET
                name = COALESCE($1, name),
                location = COALESCE($2, location),
                state = COALESCE($3, state),
                description = COALESCE($4, description),
                short_description = COALESCE($5, short_description),
                category = COALESCE($6, category),
                subcategory = COALESCE($7, subcategory),
                price = COALESCE($8, price),
                entry_fee = COALESCE($9, entry_fee),
                duration = COALESCE($10, duration),
                best_time = COALESCE($11, best_time),
                latitude = COALESCE($12, latitude),
                longitude = COALESCE($13, longitude),
                image = COALESCE($14, image),
                images = $15,
                tags = $16,
                highlights = $17,
                open_timing = COALESCE($18, open_timing),
                closed_on = COALESCE($19, closed_on),
                contact_phone = COALESCE($20, contact_phone),
                contact_email = COALESCE($21, contact_email),
                website = COALESCE($22, website),
                updated_at = NOW()
            WHERE id = $23
        `, [
            name,
            location,
            state,
            description,
            short_description,
            category,
            subcategory,
            price,
            entry_fee,
            duration,
            best_time,
            latitude,
            longitude,
            mainImage,
            JSON.stringify(images),
            JSON.stringify(tagsArray),
            JSON.stringify(highlightsArray),
            open_timing,
            closed_on,
            contact_phone,
            contact_email,
            website,
            siteId
        ]);

        await client.query('COMMIT');

        res.json({
            success: true,
            message: 'Site updated successfully'
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error updating site:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update site',
            error: error.message
        });
    } finally {
        client.release();
    }
});

// Delete site image
router.delete('/sites/:siteId/images', async (req, res) => {
    const client = await db.pool.connect();
    
    try {
        await client.query('BEGIN');
        
        const { siteId } = req.params;
        const { imagePath } = req.body;
        const enterpriseId = req.user.id;
        
        const enterpriseQuery = await client.query(
            'SELECT id FROM enterprises WHERE user_id = $1',
            [enterpriseId]
        );
        
        if (enterpriseQuery.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({
                success: false,
                message: 'Enterprise profile not found'
            });
        }
        
        const enterpriseRecordId = enterpriseQuery.rows[0].id;

        const siteQuery = await client.query(
            'SELECT images, image FROM heritage_sites WHERE id = $1 AND enterprise_id = $2',
            [siteId, enterpriseRecordId]
        );

        if (siteQuery.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({
                success: false,
                message: 'Site not found'
            });
        }

        let images = siteQuery.rows[0].images;
        if (images) {
            if (typeof images === 'string') {
                try {
                    images = JSON.parse(images);
                } catch (e) {
                    images = [];
                }
            }
        } else {
            images = [];
        }

        // Remove image from array
        images = images.filter(img => img !== imagePath);

        // If main image is being deleted, set new main image
        let mainImage = siteQuery.rows[0].image;
        if (mainImage === imagePath) {
            mainImage = images.length > 0 ? images[0] : null;
        }

        // Delete file from filesystem
        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
        }

        await client.query(`
            UPDATE heritage_sites 
            SET images = $1, image = $2, updated_at = NOW()
            WHERE id = $3
        `, [JSON.stringify(images), mainImage, siteId]);

        await client.query('COMMIT');

        res.json({
            success: true,
            message: 'Image deleted successfully',
            data: { images, mainImage }
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error deleting image:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete image',
            error: error.message
        });
    } finally {
        client.release();
    }
});

// ==================== BOOKINGS MANAGEMENT ====================

// Get all bookings for enterprise
router.get('/bookings', async (req, res) => {
    try {
        const enterpriseId = req.user.id;
        
        const enterpriseQuery = await db.query(
            'SELECT id FROM enterprises WHERE user_id = $1',
            [enterpriseId]
        );
        
        if (enterpriseQuery.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Enterprise profile not found'
            });
        }
        
        const enterpriseRecordId = enterpriseQuery.rows[0].id;

        const { status, startDate, endDate, page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        let query = `
            SELECT 
                b.*,
                hs.name as site_name,
                hs.location as site_location,
                u.email as user_email,
                u.full_name as user_name
            FROM bookings b
            JOIN heritage_sites hs ON b.site_id = hs.id
            JOIN users u ON b.user_id = u.id
            WHERE hs.enterprise_id = $1
        `;
        const values = [enterpriseRecordId];
        let paramCount = 2;

        if (status) {
            query += ` AND b.status = $${paramCount}`;
            values.push(status);
            paramCount++;
        }

        if (startDate) {
            query += ` AND b.travel_date >= $${paramCount}`;
            values.push(startDate);
            paramCount++;
        }

        if (endDate) {
            query += ` AND b.travel_date <= $${paramCount}`;
            values.push(endDate);
            paramCount++;
        }

        query += ` ORDER BY b.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
        values.push(limit, offset);

        const bookingsQuery = await db.query(query, values);

        // Get total count
        const countQuery = `
            SELECT COUNT(*) 
            FROM bookings b
            JOIN heritage_sites hs ON b.site_id = hs.id
            WHERE hs.enterprise_id = $1
        `;
        const countResult = await db.query(countQuery, [enterpriseRecordId]);

        res.json({
            success: true,
            data: bookingsQuery.rows,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: parseInt(countResult.rows[0].count)
            }
        });

    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch bookings',
            error: error.message
        });
    }
});

// Get booking details
router.get('/bookings/:bookingId', async (req, res) => {
    try {
        const { bookingId } = req.params;
        const enterpriseId = req.user.id;
        
        const enterpriseQuery = await db.query(
            'SELECT id FROM enterprises WHERE user_id = $1',
            [enterpriseId]
        );
        
        if (enterpriseQuery.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Enterprise profile not found'
            });
        }
        
        const enterpriseRecordId = enterpriseQuery.rows[0].id;

        const bookingQuery = await db.query(`
            SELECT 
                b.*,
                hs.name as site_name,
                hs.location as site_location,
                hs.image as site_image,
                u.email as user_email,
                u.full_name as user_name,
                u.phone as user_phone,
                t.ticket_number,
                t.qr_code,
                t.status as ticket_status
            FROM bookings b
            JOIN heritage_sites hs ON b.site_id = hs.id
            JOIN users u ON b.user_id = u.id
            LEFT JOIN tickets t ON b.id = t.booking_id
            WHERE b.id = $1 AND hs.enterprise_id = $2
        `, [bookingId, enterpriseRecordId]);

        if (bookingQuery.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        res.json({
            success: true,
            data: bookingQuery.rows[0]
        });

    } catch (error) {
        console.error('Error fetching booking:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch booking details',
            error: error.message
        });
    }
});

// Update booking status
router.patch('/bookings/:bookingId/status', async (req, res) => {
    const client = await db.pool.connect();
    
    try {
        await client.query('BEGIN');
        
        const { bookingId } = req.params;
        const { status } = req.body;
        const enterpriseId = req.user.id;
        
        const enterpriseQuery = await client.query(
            'SELECT id FROM enterprises WHERE user_id = $1',
            [enterpriseId]
        );
        
        if (enterpriseQuery.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({
                success: false,
                message: 'Enterprise profile not found'
            });
        }
        
        const enterpriseRecordId = enterpriseQuery.rows[0].id;

        // Check if booking exists and belongs to enterprise
        const bookingCheck = await client.query(`
            SELECT b.* FROM bookings b
            JOIN heritage_sites hs ON b.site_id = hs.id
            WHERE b.id = $1 AND hs.enterprise_id = $2
        `, [bookingId, enterpriseRecordId]);

        if (bookingCheck.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        await client.query(
            'UPDATE bookings SET status = $1, updated_at = NOW() WHERE id = $2',
            [status, bookingId]
        );

        await client.query('COMMIT');

        res.json({
            success: true,
            message: 'Booking status updated successfully'
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error updating booking status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update booking status',
            error: error.message
        });
    } finally {
        client.release();
    }
});

// ==================== ANALYTICS ====================

// Get detailed analytics
router.get('/analytics', async (req, res) => {
    try {
        const enterpriseId = req.user.id;
        
        const enterpriseQuery = await db.query(
            'SELECT id FROM enterprises WHERE user_id = $1',
            [enterpriseId]
        );
        
        if (enterpriseQuery.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Enterprise profile not found'
            });
        }
        
        const enterpriseRecordId = enterpriseQuery.rows[0].id;

        const { period = 'month' } = req.query;
        let interval;
        switch (period) {
            case 'week':
                interval = '7 days';
                break;
            case 'month':
                interval = '30 days';
                break;
            case 'year':
                interval = '12 months';
                break;
            default:
                interval = '30 days';
        }

        // Revenue over time
        const revenueQuery = await db.query(`
            SELECT 
                DATE_TRUNC('day', b.created_at) as date,
                COUNT(*) as bookings,
                COALESCE(SUM(b.total_amount), 0) as revenue
            FROM bookings b
            JOIN heritage_sites hs ON b.site_id = hs.id
            WHERE hs.enterprise_id = $1 
              AND b.created_at >= NOW() - INTERVAL '${interval}'
            GROUP BY DATE_TRUNC('day', b.created_at)
            ORDER BY date ASC
        `, [enterpriseRecordId]);

        // Site performance
        const sitePerformanceQuery = await db.query(`
            SELECT 
                hs.id,
                hs.name,
                hs.rating,
                hs.total_reviews,
                hs.views,
                COUNT(DISTINCT b.id) as total_bookings,
                COALESCE(SUM(b.total_amount), 0) as total_revenue,
                AVG(b.total_amount) as avg_booking_value
            FROM heritage_sites hs
            LEFT JOIN bookings b ON hs.id = b.site_id
            WHERE hs.enterprise_id = $1
            GROUP BY hs.id, hs.name, hs.rating, hs.total_reviews, hs.views
            ORDER BY total_revenue DESC
        `, [enterpriseRecordId]);

        // Booking status breakdown
        const statusQuery = await db.query(`
            SELECT 
                b.status,
                COUNT(*) as count,
                COALESCE(SUM(b.total_amount), 0) as revenue
            FROM bookings b
            JOIN heritage_sites hs ON b.site_id = hs.id
            WHERE hs.enterprise_id = $1
            GROUP BY b.status
        `, [enterpriseRecordId]);

        // Monthly comparison
        const monthlyComparisonQuery = await db.query(`
            WITH months AS (
                SELECT 
                    DATE_TRUNC('month', b.created_at) as month,
                    COUNT(*) as bookings,
                    COALESCE(SUM(b.total_amount), 0) as revenue
                FROM bookings b
                JOIN heritage_sites hs ON b.site_id = hs.id
                WHERE hs.enterprise_id = $1
                GROUP BY DATE_TRUNC('month', b.created_at)
                ORDER BY month DESC
                LIMIT 2
            )
            SELECT 
                month,
                bookings,
                revenue,
                LAG(bookings) OVER (ORDER BY month) as prev_bookings,
                LAG(revenue) OVER (ORDER BY month) as prev_revenue
            FROM months
        `, [enterpriseRecordId]);

        res.json({
            success: true,
            data: {
                revenueOverTime: revenueQuery.rows,
                sitePerformance: sitePerformanceQuery.rows,
                bookingStatus: statusQuery.rows,
                monthlyComparison: monthlyComparisonQuery.rows,
                period
            }
        });

    } catch (error) {
        console.error('Error fetching analytics:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch analytics',
            error: error.message
        });
    }
});

// Get enterprise profile
router.get('/profile', async (req, res) => {
    try {
        const enterpriseId = req.user.id;
        
        const profileQuery = await db.query(`
            SELECT e.*, u.email, u.is_verified
            FROM enterprises e
            JOIN users u ON e.user_id = u.id
            WHERE e.user_id = $1
        `, [enterpriseId]);

        if (profileQuery.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Enterprise profile not found'
            });
        }

        const profile = profileQuery.rows[0];
        
        // Parse JSON fields
        if (profile.verification_documents && typeof profile.verification_documents === 'string') {
            try {
                profile.verification_documents = JSON.parse(profile.verification_documents);
            } catch (e) {
                profile.verification_documents = {};
            }
        }
        if (profile.business_documents && typeof profile.business_documents === 'string') {
            try {
                profile.business_documents = JSON.parse(profile.business_documents);
            } catch (e) {
                profile.business_documents = {};
            }
        }
        if (profile.tax_documents && typeof profile.tax_documents === 'string') {
            try {
                profile.tax_documents = JSON.parse(profile.tax_documents);
            } catch (e) {
                profile.tax_documents = {};
            }
        }
        if (profile.bank_details && typeof profile.bank_details === 'string') {
            try {
                profile.bank_details = JSON.parse(profile.bank_details);
            } catch (e) {
                profile.bank_details = {};
            }
        }

        res.json({
            success: true,
            data: profile
        });

    } catch (error) {
        console.error('Error fetching enterprise profile:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch profile',
            error: error.message
        });
    }
});

// Update enterprise profile
router.put('/profile', async (req, res) => {
    try {
        const enterpriseId = req.user.id;
        const {
            enterprise_name,
            owner_name,
            business_type,
            description,
            location,
            phone,
            website,
            established_year,
            employee_count
        } = req.body;

        await db.query(`
            UPDATE enterprises SET
                enterprise_name = COALESCE($1, enterprise_name),
                owner_name = COALESCE($2, owner_name),
                business_type = COALESCE($3, business_type),
                description = COALESCE($4, description),
                location = COALESCE($5, location),
                phone = COALESCE($6, phone),
                website = COALESCE($7, website),
                established_year = COALESCE($8, established_year),
                employee_count = COALESCE($9, employee_count),
                updated_at = NOW()
            WHERE user_id = $10
        `, [
            enterprise_name,
            owner_name,
            business_type,
            description,
            location,
            phone,
            website,
            established_year,
            employee_count,
            enterpriseId
        ]);

        res.json({
            success: true,
            message: 'Profile updated successfully'
        });

    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update profile',
            error: error.message
        });
    }
});

module.exports = router;