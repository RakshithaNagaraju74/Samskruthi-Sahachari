// routes/heritageRoutes.js
const express = require('express');
const router = express.Router();
const HeritageSite = require('../models/HeritageSite');
const Review = require('../models/Review');
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
        const sites = await HeritageSite.getFeatured();
        
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
        
        if (!q) {
            return res.status(400).json({
                success: false,
                message: 'Search query is required'
            });
        }

        const sites = await HeritageSite.search(q);
        
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

        const sites = await HeritageSite.getNearby(
            parseFloat(lat), 
            parseFloat(lng), 
            radius ? parseFloat(radius) : 50
        );
        
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

// Get reviews for a site
router.get('/sites/:id/reviews', async (req, res) => {
    try {
        const { id } = req.params;
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

// Add a review (protected)
router.post('/sites/:id/reviews', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const { rating, title, comment, visit_date } = req.body;

        if (!rating || !comment) {
            return res.status(400).json({
                success: false,
                message: 'Rating and comment are required'
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