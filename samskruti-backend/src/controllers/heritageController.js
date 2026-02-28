const HeritageSite = require('../models/HeritageSite');

// Get all heritage sites
const getAllSites = async (req, res) => {
  try {
    const sites = await HeritageSite.getAll();
    res.json({ success: true, data: sites });
  } catch (error) {
    console.error('Error in getAllSites:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch sites' });
  }
};

// Get site by ID
const getSiteById = async (req, res) => {
  try {
    const { id } = req.params;
    const site = await HeritageSite.findById(id);
    if (!site) {
      return res.status(404).json({ success: false, message: 'Site not found' });
    }
    // Increment view count (optional)
    await HeritageSite.incrementView(id);
    res.json({ success: true, data: site });
  } catch (error) {
    console.error('Error in getSiteById:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch site' });
  }
};

// Create a new site
const createSite = async (req, res) => {
  try {
    // Assuming the request body contains all necessary fields
    const siteData = req.body;
    const newSite = await HeritageSite.create(siteData);
    res.status(201).json({ success: true, data: newSite });
  } catch (error) {
    console.error('Error in createSite:', error);
    res.status(500).json({ success: false, message: 'Failed to create site' });
  }
};

// Update an existing site
const updateSite = async (req, res) => {
  try {
    const { id } = req.params;
    const siteData = req.body;
    const updatedSite = await HeritageSite.update(id, siteData);
    if (!updatedSite) {
      return res.status(404).json({ success: false, message: 'Site not found' });
    }
    res.json({ success: true, data: updatedSite });
  } catch (error) {
    console.error('Error in updateSite:', error);
    res.status(500).json({ success: false, message: 'Failed to update site' });
  }
};

// Soft delete a site
const deleteSite = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await HeritageSite.delete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Site not found' });
    }
    res.json({ success: true, message: 'Site deleted successfully' });
  } catch (error) {
    console.error('Error in deleteSite:', error);
    res.status(500).json({ success: false, message: 'Failed to delete site' });
  }
};

// Get sites by category
const getSitesByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const sites = await HeritageSite.getByCategory(category);
    res.json({ success: true, data: sites });
  } catch (error) {
    console.error('Error in getSitesByCategory:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch sites' });
  }
};

// Get sites by site type
const getSitesByType = async (req, res) => {
  try {
    const { siteType } = req.params;
    const sites = await HeritageSite.getBySiteType(siteType);
    res.json({ success: true, data: sites });
  } catch (error) {
    console.error('Error in getSitesByType:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch sites' });
  }
};

// Get UNESCO sites
const getUnescoSites = async (req, res) => {
  try {
    const sites = await HeritageSite.getUnesco();
    res.json({ success: true, data: sites });
  } catch (error) {
    console.error('Error in getUnescoSites:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch sites' });
  }
};

// Get featured sites
const getFeaturedSites = async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : undefined;
    const sites = await HeritageSite.getFeatured(limit);
    res.json({ success: true, data: sites });
  } catch (error) {
    console.error('Error in getFeaturedSites:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch sites' });
  }
};

// Search sites
const searchSites = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.json({ success: true, data: [] });
    }
    const sites = await HeritageSite.search(q);
    res.json({ success: true, data: sites });
  } catch (error) {
    console.error('Error in searchSites:', error);
    res.status(500).json({ success: false, message: 'Failed to search sites' });
  }
};

// Get sites by district
const getSitesByDistrict = async (req, res) => {
  try {
    const { district } = req.params;
    const sites = await HeritageSite.getByDistrict(district);
    res.json({ success: true, data: sites });
  } catch (error) {
    console.error('Error in getSitesByDistrict:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch sites' });
  }
};

// Get sites by enterprise ID
const getSitesByEnterprise = async (req, res) => {
  try {
    const { enterpriseId } = req.params;
    const sites = await HeritageSite.getByEnterpriseId(enterpriseId);
    res.json({ success: true, data: sites });
  } catch (error) {
    console.error('Error in getSitesByEnterprise:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch sites' });
  }
};

// Get filtered sites (using query parameters)
const getFilteredSites = async (req, res) => {
  try {
    const filters = req.query; // expects category, site_type, district, minRating, isUnesco, isFeatured, enterprise_id
    const sites = await HeritageSite.getFiltered(filters);
    res.json({ success: true, data: sites });
  } catch (error) {
    console.error('Error in getFilteredSites:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch sites' });
  }
};

// Get nearby sites
const getNearbySites = async (req, res) => {
  try {
    const { lat, lng, radius } = req.query;
    if (!lat || !lng) {
      return res.status(400).json({ success: false, message: 'Latitude and longitude are required' });
    }
    const sites = await HeritageSite.getNearby(parseFloat(lat), parseFloat(lng), radius ? parseInt(radius) : undefined);
    res.json({ success: true, data: sites });
  } catch (error) {
    console.error('Error in getNearbySites:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch nearby sites' });
  }
};

// Get all districts
const getDistricts = async (req, res) => {
  try {
    const districts = await HeritageSite.getDistricts();
    res.json({ success: true, data: districts });
  } catch (error) {
    console.error('Error in getDistricts:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch districts' });
  }
};

// Get all categories
const getCategories = async (req, res) => {
  try {
    const categories = await HeritageSite.getCategories();
    res.json({ success: true, data: categories });
  } catch (error) {
    console.error('Error in getCategories:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch categories' });
  }
};

// Get all site types
const getSiteTypes = async (req, res) => {
  try {
    const siteTypes = await HeritageSite.getSiteTypes();
    res.json({ success: true, data: siteTypes });
  } catch (error) {
    console.error('Error in getSiteTypes:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch site types' });
  }
};

// Get site statistics
const getSiteStats = async (req, res) => {
  try {
    const stats = await HeritageSite.getStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Error in getSiteStats:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch statistics' });
  }
};

// Get reviews for a site
const getReviews = async (req, res) => {
  try {
    const { siteId } = req.params;
    // Assuming there is a method in the model or a separate review model
    // For now, return empty array or implement if needed
    res.json({ success: true, data: [] });
  } catch (error) {
    console.error('Error in getReviews:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch reviews' });
  }
};

// Add a review for a site
const addReview = async (req, res) => {
  try {
    const { siteId } = req.params;
    const reviewData = req.body;
    // Implementation depends on review model
    res.status(201).json({ success: true, data: { id: 1, ...reviewData } });
  } catch (error) {
    console.error('Error in addReview:', error);
    res.status(500).json({ success: false, message: 'Failed to add review' });
  }
};

// Get products associated with a site (NEW)
const getSiteProducts = async (req, res) => {
  try {
    const siteId = req.params.id;
    const products = await HeritageSite.getProducts(siteId);
    res.json({ success: true, data: products });
  } catch (error) {
    console.error('Error in getSiteProducts:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch products' });
  }
};

module.exports = {
  getAllSites,
  getSiteById,
  createSite,
  updateSite,
  deleteSite,
  getSitesByCategory,
  getSitesByType,
  getUnescoSites,
  getFeaturedSites,
  searchSites,
  getSitesByDistrict,
  getSitesByEnterprise,
  getFilteredSites,
  getNearbySites,
  getDistricts,
  getCategories,
  getSiteTypes,
  getSiteStats,
  getReviews,
  addReview,
  getSiteProducts, // <-- add this
};