const express = require('express');
const router = express.Router();
const db = require('../config/database'); // 👈 ADD THIS LINE
const HeritageSite = require('../models/HeritageSite');
const Review = require('../models/Review');
const heritageController = require('../controllers/heritageController');
const { authMiddleware } = require('../middlewares/authMiddleware');

// Get all heritage sites
router.get('/sites', async (req, res) => {
    try {
        console.log('Fetching heritage sites...');
        const sites = await HeritageSite.getAll();
        
        res.json({
            success: true,
            data: sites,
            count: sites.length
        });
    } catch (error) {
        console.error('Error fetching heritage sites:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch heritage sites',
            error: error.message
        });
    }
});

// Get heritage site by ID
router.get('/sites/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        // Validate ID
        if (isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid site ID'
            });
        }

        const site = await HeritageSite.findById(id);
        
        if (!site) {
            return res.status(404).json({
                success: false,
                message: 'Heritage site not found'
            });
        }

        // Increment view count
        await HeritageSite.incrementView(id);

        res.json({
            success: true,
            data: site
        });
    } catch (error) {
        console.error('Error fetching heritage site:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch heritage site'
        });
    }
});

// Get sites by category
router.get('/sites/category/:category', async (req, res) => {
    try {
        const { category } = req.params;
        
        if (!category) {
            return res.status(400).json({
                success: false,
                message: 'Category is required'
            });
        }

        const sites = await HeritageSite.getByCategory(category);
        
        res.json({
            success: true,
            data: sites,
            count: sites.length
        });
    } catch (error) {
        console.error('Error fetching sites by category:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch sites'
        });
    }
});

// Get sites by site type
router.get('/sites/type/:siteType', async (req, res) => {
    try {
        const { siteType } = req.params;
        
        if (!siteType) {
            return res.status(400).json({
                success: false,
                message: 'Site type is required'
            });
        }

        const sites = await HeritageSite.getBySiteType(siteType);
        
        res.json({
            success: true,
            data: sites,
            count: sites.length
        });
    } catch (error) {
        console.error('Error fetching sites by type:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch sites'
        });
    }
});

// Get UNESCO sites
router.get('/unesco', async (req, res) => {
    try {
        const sites = await HeritageSite.getUnesco();
        
        res.json({
            success: true,
            data: sites,
            count: sites.length
        });
    } catch (error) {
        console.error('Error fetching UNESCO sites:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch UNESCO sites'
        });
    }
});

// Get featured sites
router.get('/featured', async (req, res) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit) : 6;
        const sites = await HeritageSite.getFeatured(limit);
        
        res.json({
            success: true,
            data: sites,
            count: sites.length
        });
    } catch (error) {
        console.error('Error fetching featured sites:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch featured sites'
        });
    }
});

// Search sites
router.get('/search', async (req, res) => {
    try {
        const { q } = req.query;
        
        if (!q || q.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Search query is required'
            });
        }

        const sites = await HeritageSite.search(q.trim());
        
        res.json({
            success: true,
            data: sites,
            count: sites.length,
            query: q
        });
    } catch (error) {
        console.error('Error searching sites:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to search sites'
        });
    }
});

// Get sites by district
router.get('/district/:district', async (req, res) => {
    try {
        const { district } = req.params;
        
        if (!district) {
            return res.status(400).json({
                success: false,
                message: 'District is required'
            });
        }

        const sites = await HeritageSite.getByDistrict(district);
        
        res.json({
            success: true,
            data: sites,
            count: sites.length
        });
    } catch (error) {
        console.error('Error fetching sites by district:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch sites'
        });
    }
});

// Get sites by enterprise
router.get('/enterprise/:enterpriseId', async (req, res) => {
    try {
        const { enterpriseId } = req.params;
        
        if (isNaN(enterpriseId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid enterprise ID'
            });
        }

        const sites = await HeritageSite.getByEnterpriseId(enterpriseId);
        
        res.json({
            success: true,
            data: sites,
            count: sites.length
        });
    } catch (error) {
        console.error('Error fetching sites by enterprise:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch sites'
        });
    }
});

// Get filtered sites
router.get('/filter', async (req, res) => {
    try {
        const sites = await HeritageSite.getFiltered(req.query);
        
        res.json({
            success: true,
            data: sites,
            count: sites.length
        });
    } catch (error) {
        console.error('Error filtering sites:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to filter sites'
        });
    }
});

// Get nearby sites
router.get('/nearby', async (req, res) => {
    try {
        const { lat, lng, radius } = req.query;
        
        if (!lat || !lng) {
            return res.status(400).json({
                success: false,
                message: 'Latitude and longitude are required'
            });
        }

        const parsedLat = parseFloat(lat);
        const parsedLng = parseFloat(lng);
        const parsedRadius = radius ? parseFloat(radius) : 50;

        if (isNaN(parsedLat) || isNaN(parsedLng) || isNaN(parsedRadius)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid coordinates or radius'
            });
        }

        const sites = await HeritageSite.getNearby(parsedLat, parsedLng, parsedRadius);
        
        res.json({
            success: true,
            data: sites,
            count: sites.length
        });
    } catch (error) {
        console.error('Error getting nearby sites:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get nearby sites'
        });
    }
});

// GET /api/heritage/recommended?categories=heritage,nature
router.get('/recommended', async (req, res) => {
    try {
        const { categories } = req.query;
        if (!categories) {
            return res.status(400).json({ success: false, message: 'Categories required' });
        }
        const categoryArray = categories.split(',').map(c => c.trim());
        const result = await db.query(
            `SELECT * FROM heritage_sites 
             WHERE is_active = true AND category = ANY($1::text[])
             ORDER BY rating DESC NULLS LAST, views DESC
             LIMIT 10`,
            [categoryArray]
        );
        // Normalize sites (use the same normalization as in your heritageService)
        const sites = result.rows.map(site => ({
            ...site,
            gallery_images: site.gallery_images ? 
                (typeof site.gallery_images === 'string' ? JSON.parse(site.gallery_images) : site.gallery_images) : [],
            tags: site.tags ? (typeof site.tags === 'string' ? JSON.parse(site.tags) : site.tags) : [],
            highlights: site.highlights ? (typeof site.highlights === 'string' ? JSON.parse(site.highlights) : site.highlights) : [],
            pickup_points: site.pickup_points ? (typeof site.pickup_points === 'string' ? JSON.parse(site.pickup_points) : site.pickup_points) : []
        }));
        res.json({ success: true, data: sites });
    } catch (error) {
        console.error('Error fetching recommended sites:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch recommendations' });
    }
});

// Get all districts
router.get('/districts', async (req, res) => {
    try {
        const districts = await HeritageSite.getDistricts();
        
        res.json({
            success: true,
            data: districts
        });
    } catch (error) {
        console.error('Error fetching districts:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch districts'
        });
    }
});

// Get all categories
router.get('/categories', async (req, res) => {
    try {
        const categories = await HeritageSite.getCategories();
        
        res.json({
            success: true,
            data: categories
        });
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch categories'
        });
    }
});

// Get all site types
router.get('/site-types', async (req, res) => {
    try {
        const siteTypes = await HeritageSite.getSiteTypes();
        
        res.json({
            success: true,
            data: siteTypes
        });
    } catch (error) {
        console.error('Error fetching site types:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch site types'
        });
    }
});

// Get site statistics
router.get('/stats', async (req, res) => {
    try {
        const stats = await HeritageSite.getStats();
        
        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Error fetching site stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch site statistics'
        });
    }
});

// Get reviews for a site
router.get('/sites/:id/reviews', async (req, res) => {
    try {
        const { id } = req.params;
        
        if (isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid site ID'
            });
        }

        // Check if site exists
        const site = await HeritageSite.findById(id);
        if (!site) {
            return res.status(404).json({
                success: false,
                message: 'Heritage site not found'
            });
        }

        const reviews = await Review.getBySiteId(id);
        
        res.json({
            success: true,
            data: reviews,
            count: reviews.length
        });
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch reviews'
        });
    }
});
router.get('/sites/:id/products', heritageController.getSiteProducts);
// Add a review (protected)
router.post('/sites/:id/reviews', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const { rating, title, comment, visit_date } = req.body;

        if (isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid site ID'
            });
        }

        // Check if site exists
        const site = await HeritageSite.findById(id);
        if (!site) {
            return res.status(404).json({
                success: false,
                message: 'Heritage site not found'
            });
        }

        // Validate input
        if (!rating || !comment) {
            return res.status(400).json({
                success: false,
                message: 'Rating and comment are required'
            });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: 'Rating must be between 1 and 5'
            });
        }

        const review = await Review.create({
            user_id: userId,
            site_id: id,
            rating,
            title,
            comment,
            visit_date
        });

        res.status(201).json({
            success: true,
            message: 'Review added successfully',
            data: review
        });
    } catch (error) {
        console.error('Error adding review:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add review'
        });
    }
});

module.exports = router;