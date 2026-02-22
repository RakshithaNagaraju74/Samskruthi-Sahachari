const groqService = require('../services/groqService');
const Destination = require('../models/Destination');
const User = require('../models/User');

class AIController {
  async getRecommendations(req, res) {
    try {
      const userId = req.user.id;
      const user = await User.findById(userId);
      const destinations = await Destination.getAll();
      
      if (!destinations || destinations.length === 0) {
        return res.json({
          success: true,
          data: []
        });
      }

      // Get user preferences and history
      const userData = {
        user_type: user.user_type,
        preferences: req.body.preferences || {},
        history: await Destination.getUserHistory(userId).catch(() => []),
        budget: req.body.budget
      };

      const recommendations = await groqService.getPersonalizedRecommendations(
        userData,
        destinations
      );

      // Enhance recommendations with full destination data
      const enhancedRecommendations = recommendations
        .map(rec => ({
          ...rec,
          destination: destinations.find(d => d.id === rec.id)
        }))
        .filter(rec => rec.destination) // Remove any null destinations
        .slice(0, 6);

      res.json({
        success: true,
        data: enhancedRecommendations
      });
    } catch (error) {
      console.error('AI Recommendations Error:', error);
      
      // Fallback to popular destinations
      try {
        const destinations = await Destination.getAll();
        const fallbackRecs = destinations
          .sort((a, b) => b.rating - a.rating)
          .slice(0, 6)
          .map(d => ({
            id: d.id,
            score: d.rating * 10,
            reason: `Popular destination with ${d.rating} rating`,
            matchTags: (d.tags || []).slice(0, 3),
            destination: d
          }));
        
        return res.json({
          success: true,
          data: fallbackRecs,
          fallback: true
        });
      } catch (fallbackError) {
        res.status(500).json({
          success: false,
          message: 'Error generating recommendations'
        });
      }
    }
  }

  async getDestinationInsights(req, res) {
    try {
      const { id } = req.params;
      const destination = await Destination.findById(id);
      
      if (!destination) {
        return res.status(404).json({
          success: false,
          message: 'Destination not found'
        });
      }

      const insights = await groqService.getDestinationInsights(destination);

      res.json({
        success: true,
        data: insights
      });
    } catch (error) {
      console.error('AI Insights Error:', error);
      res.status(500).json({
        success: false,
        message: 'Error generating insights'
      });
    }
  }

  async generateItinerary(req, res) {
    try {
      const { destinationIds, days, preferences } = req.body;
      const userId = req.user.id;

      const itinerary = await groqService.generateItinerary(
        userId,
        preferences,
        destinationIds,
        days
      );

      res.json({
        success: true,
        data: itinerary
      });
    } catch (error) {
      console.error('Itinerary Generation Error:', error);
      res.status(500).json({
        success: false,
        message: 'Error generating itinerary'
      });
    }
  }

  async findSimilar(req, res) {
    try {
      const { id } = req.params;
      const destination = await Destination.findById(id);
      const allDestinations = await Destination.getAll();

      const similar = await groqService.findSimilarDestinations(
        destination,
        allDestinations
      );

      // Enhance with full destination data
      const enhancedSimilar = similar.map(s => ({
        ...s,
        destination: allDestinations.find(d => d.id === s.id)
      })).filter(s => s.destination);

      res.json({
        success: true,
        data: enhancedSimilar
      });
    } catch (error) {
      console.error('Similar Destinations Error:', error);
      res.status(500).json({
        success: false,
        message: 'Error finding similar destinations'
      });
    }
  }

  async getEnterpriseRecommendations(req, res) {
    try {
      const { preferences } = req.body;
      const userId = req.user.id;

      const recommendations = await groqService.getEnterpriseRecommendations(
        userId,
        preferences
      );

      res.json({
        success: true,
        data: recommendations
      });
    } catch (error) {
      console.error('Enterprise Recommendations Error:', error);
      res.status(500).json({
        success: false,
        message: 'Error generating enterprise recommendations'
      });
    }
  }

  async analyzeDestinationReviews(req, res) {
    try {
      const { id } = req.params;
      const reviews = await Destination.getReviews(id);

      const analysis = await groqService.analyzeSentiment(
        reviews.map(r => r.comment)
      );

      res.json({
        success: true,
        data: analysis
      });
    } catch (error) {
      console.error('Sentiment Analysis Error:', error);
      res.status(500).json({
        success: false,
        message: 'Error analyzing reviews'
      });
    }
  }
}

module.exports = new AIController();