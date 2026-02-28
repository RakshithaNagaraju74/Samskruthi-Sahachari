const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { validateLogin } = require('../utils/validation');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Debug: Check what's being imported
console.log('AuthController type:', typeof AuthController);
console.log('AuthController.register type:', typeof AuthController.register);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/documents';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only .png, .jpg, .jpeg and .pdf files are allowed'));
    }
  }
});

// Public routes
// Registration with user type parameter (user, enterprise, seller)
router.post('/register/:userType', upload.fields([
  { name: 'registrationCert', maxCount: 1 },
  { name: 'gstCert', maxCount: 1 },
  { name: 'panCard', maxCount: 1 },
  { name: 'addressProof', maxCount: 1 },
  { name: 'bankStatement', maxCount: 1 }
]), AuthController.register);

router.post('/login', validateLogin, AuthController.login);
router.post('/refresh-token', AuthController.refreshToken);
router.post('/logout', AuthController.logout);

// Protected routes
router.get('/me', authMiddleware, AuthController.getCurrentUser);

module.exports = router;