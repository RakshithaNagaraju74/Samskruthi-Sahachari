const express = require('express');
const router = express.Router();
const { getAllProductsPublic } = require('../controllers/publicProductController');
const { authMiddleware } = require('../middlewares/authMiddleware'); // optional, if you want to require login

// Allow any authenticated user (including enterprises) to view products
router.get('/', authMiddleware, getAllProductsPublic);

module.exports = router;