const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { validateRegistration, validateLogin } = require('../utils/validation');

// Public routes
router.post('/register/:userType', (req, res, next) => {
  const { userType } = req.params;
  const validations = validateRegistration(userType);
  Promise.all(validations.map(validation => validation.run(req)))
    .then(() => next());
}, AuthController.register);

router.post('/login', validateLogin, AuthController.login);
router.post('/refresh-token', AuthController.refreshToken);
router.post('/logout', AuthController.logout);

// Protected routes
router.get('/me', authMiddleware, AuthController.getCurrentUser);

module.exports = router;