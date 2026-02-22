// src/routes/heritageRoutes.js
const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Get all heritage sites
router.get('/sites', async (req, res) => {
  try {
    console.log('Fetching heritage sites...');
    
    const result = await pool.query(`
      SELECT 
        hs.*,
        jsonb_build_object(
          'id', ep.id,
          'company_name', ep.company_name,
          'logo', ep.logo,
          'verified', ep.verified
        ) as enterprise
      FROM heritage_sites hs
      LEFT JOIN enterprise_profiles ep ON hs.enterprise_id = ep.id
      WHERE hs.is_active = true
      ORDER BY hs.is_featured DESC, hs.name
    `);

    console.log(`Found ${result.rows.length} heritage sites`);

    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('Error fetching heritage sites:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch heritage sites',
      error: error.message,
      data: []
    });
  }
});

// Get heritage site by ID
router.get('/sites/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(`
      SELECT 
        hs.*,
        jsonb_build_object(
          'id', ep.id,
          'company_name', ep.company_name,
          'logo', ep.logo,
          'verified', ep.verified,
          'phone', ep.company_phone,
          'email', ep.company_email
        ) as enterprise
      FROM heritage_sites hs
      LEFT JOIN enterprise_profiles ep ON hs.enterprise_id = ep.id
      WHERE hs.id = $1 AND hs.is_active = true
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Heritage site not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching heritage site:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch heritage site'
    });
  }
});

// Get heritage sites by category
router.get('/sites/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    
    const result = await pool.query(`
      SELECT * FROM heritage_sites 
      WHERE category = $1 AND is_active = true
      ORDER BY name
    `, [category]);

    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('Error fetching heritage sites by category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch heritage sites'
    });
  }
});

// Get UNESCO sites
router.get('/unesco', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM heritage_sites 
      WHERE type = 'UNESCO World Heritage' AND is_active = true
      ORDER BY name
    `);

    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('Error fetching UNESCO sites:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch UNESCO sites'
    });
  }
});

module.exports = router;