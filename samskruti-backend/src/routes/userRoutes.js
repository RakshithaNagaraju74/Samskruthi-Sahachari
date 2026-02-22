const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/authMiddleware');
const User = require('../models/User');
const UserProfile = require('../models/UserProfile');

// Get current user profile
// Add this to your backend userRoutes.js
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    console.log('Profile request for user ID:', req.user.id);
    
    const user = await User.findById(req.user.id);
    const profile = await UserProfile.findByUserId(req.user.id);
    
    console.log('Found user:', user);
    console.log('Found profile:', profile);
    
    res.json({
      success: true,
      data: {
        user,
        profile
      }
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching profile'
    });
  }
});

// Update user profile
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { full_name, phone, date_of_birth, gender } = req.body;
    
    const updatedProfile = await UserProfile.update(req.user.id, {
      full_name,
      phone,
      date_of_birth,
      gender
    });
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedProfile
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile'
    });
  }
});

// Get user's bookings (mock for now - will be implemented with bookings table)
router.get('/bookings', authMiddleware, async (req, res) => {
  try {
    // This will be replaced with actual bookings query
    const mockBookings = [
      {
        id: 1,
        destination: "Coorg Valley",
        date: "2025-03-15",
        status: "confirmed",
        price: 3499
      },
      {
        id: 2,
        destination: "Hampi Ruins",
        date: "2025-04-05",
        status: "pending",
        price: 1999
      }
    ];
    
    res.json({
      success: true,
      data: mockBookings
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching bookings'
    });
  }
});

// Get user's favorites
router.get('/favorites', authMiddleware, async (req, res) => {
  try {
    // This will be implemented with favorites table
    res.json({
      success: true,
      data: []
    });
  } catch (error) {
    console.error('Error fetching favorites:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching favorites'
    });
  }
});
// Add to existing userRoutes.js

// Track user view
router.post('/track-view', authMiddleware, async (req, res) => {
  try {
    const { destinationId } = req.body;
    
    // Store in database - create user_views table if not exists
    const query = `
      INSERT INTO user_views (user_id, destination_id, viewed_at)
      VALUES ($1, $2, CURRENT_TIMESTAMP)
    `;
    
    await db.query(query, [req.user.id, destinationId]);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error tracking view:', error);
    res.status(500).json({ success: false });
  }
});

// Get user preferences
router.get('/preferences', authMiddleware, async (req, res) => {
  try {
    // Get user's favorite categories based on views
    const viewsQuery = `
      SELECT d.category, COUNT(*) as view_count
      FROM user_views uv
      JOIN destinations d ON d.id = uv.destination_id
      WHERE uv.user_id = $1
      GROUP BY d.category
      ORDER BY view_count DESC
      LIMIT 3
    `;
    
    const views = await db.query(viewsQuery, [req.user.id]);
    
    // Get user's bookings
    const bookingsQuery = `
      SELECT * FROM bookings WHERE user_id = $1 ORDER BY date DESC
    `;
    
    const bookings = await db.query(bookingsQuery, [req.user.id]);
    
    res.json({
      success: true,
      data: {
        favorite_categories: views.rows.map(v => v.category),
        view_history: views.rows,
        bookings: bookings.rows
      }
    });
  } catch (error) {
    console.error('Error fetching preferences:', error);
    res.status(500).json({ success: false });
  }
});
// src/routes/userRoutes.js - Add this GET endpoint
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const profile = await UserProfile.findByUserId(req.user.id);
    
    console.log('Fetching profile for user:', req.user.id);
    console.log('Found profile:', profile);
    
    res.json({
      success: true,
      data: {
        user,
        profile
      }
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching profile'
    });
  }
});
module.exports = router;