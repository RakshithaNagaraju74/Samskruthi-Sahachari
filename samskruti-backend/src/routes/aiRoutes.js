const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { authMiddleware } = require('../middlewares/authMiddleware');

// All AI routes require authentication
router.use(authMiddleware);

// Get personalized recommendations
router.post('/recommendations', aiController.getRecommendations);

// Get destination insights
router.get('/insights/:id', aiController.getDestinationInsights);

// Generate itinerary
router.post('/itinerary', aiController.generateItinerary);

// Find similar destinations
router.get('/similar/:id', aiController.findSimilar);

// Get enterprise recommendations
router.post('/enterprise-recommendations', aiController.getEnterpriseRecommendations);

// Analyze destination reviews
router.get('/analyze/:id', aiController.analyzeDestinationReviews);

module.exports = router;