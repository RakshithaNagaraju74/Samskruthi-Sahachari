// routes/enterpriseDestinationRoutes.js
const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Get all approved destinations
router.get('/destinations/approved', async (req, res) => {
  try {
    console.log('Fetching approved destinations...');
    
    // First check if enterprise_destinations table exists and has data
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'enterprise_destinations'
      );
    `);

    if (!tableCheck.rows[0].exists) {
      return res.status(404).json({
        success: false,
        message: 'enterprise_destinations table does not exist',
        data: []
      });
    }

    const result = await pool.query(`
      SELECT 
        ed.*,
        json_build_object(
          'id', ep.id,
          'company_name', ep.company_name,
          'logo', ep.logo,
          'verified', ep.verified,
          'description', ep.description,
          'phone', ep.company_phone,
          'email', ep.company_email
        ) as enterprise
      FROM enterprise_destinations ed
      LEFT JOIN enterprise_profiles ep ON ed.enterprise_id = ep.id
      WHERE ed.status = 'approved' AND ed.is_approved = true
      ORDER BY ed.created_at DESC
    `);

    console.log(`Found ${result.rows.length} approved destinations`);

    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('Error fetching approved destinations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch destinations',
      error: error.message,
      data: []
    });
  }
});

// Get destination by ID
router.get('/destinations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(`
      SELECT 
        ed.*,
        json_build_object(
          'id', ep.id,
          'company_name', ep.company_name,
          'logo', ep.logo,
          'verified', ep.verified,
          'description', ep.description,
          'phone', ep.company_phone,
          'email', ep.company_email
        ) as enterprise
      FROM enterprise_destinations ed
      LEFT JOIN enterprise_profiles ep ON ed.enterprise_id = ep.id
      WHERE ed.id = $1 AND ed.status = 'approved'
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Destination not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching destination:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch destination'
    });
  }
});

module.exports = router;