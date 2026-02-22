const User = require('../models/User');
const UserProfile = require('../models/UserProfile');
const EnterpriseProfile = require('../models/EnterpriseProfile');
const SellerProfile = require('../models/SellerProfile');
const { generateToken, generateRefreshToken, verifyToken } = require('../utils/generateToken');
const { validationResult } = require('express-validator');

class AuthController {
  // Register new user
  static async register(req, res) {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const { email, password, user_type, ...profileData } = req.body;

      // Check if user already exists
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User with this email already exists'
        });
      }

      // Create user
      const user = await User.create({
        email,
        password,
        user_type
      });

      // Create profile based on user type
      let profile;
      switch(user_type) {
        case 'enterprise':
          profile = await EnterpriseProfile.create({
            user_id: user.id,
            ...profileData
          });
          break;
        case 'seller':
          profile = await SellerProfile.create({
            user_id: user.id,
            ...profileData
          });
          break;
        default:
          profile = await UserProfile.create({
            user_id: user.id,
            ...profileData
          });
      }

      // Generate token
      const token = generateToken(user);
      const refreshToken = generateRefreshToken(user);

      res.status(201).json({
        success: true,
        message: 'Registration successful',
        data: {
          user: {
            id: user.id,
            email: user.email,
            user_type: user.user_type
          },
          profile,
          token,
          refreshToken
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Error during registration',
        error: error.message
      });
    }
  }

  // Login user
  static async login(req, res) {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const { email, password, rememberMe } = req.body;

      // Find user
      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      // Check if user is active
      if (!user.is_active) {
        return res.status(401).json({
          success: false,
          message: 'Account is deactivated. Please contact support.'
        });
      }

      // Verify password
      const isValidPassword = await User.verifyPassword(user, password);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      // Update last login
      await User.updateLastLogin(user.id);

      // Get profile based on user type
      let profile;
      switch(user.user_type) {
        case 'enterprise':
          profile = await EnterpriseProfile.findByUserId(user.id);
          break;
        case 'seller':
          profile = await SellerProfile.findByUserId(user.id);
          break;
        default:
          profile = await UserProfile.findByUserId(user.id);
      }

      // Generate tokens
      const token = generateToken(user);
      const refreshToken = generateRefreshToken(user);

      // Create session if remember me is checked
      if (rememberMe) {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

        // Format device info as an object, not a string
        const deviceInfo = {
          userAgent: req.headers['user-agent'],
          platform: req.headers['sec-ch-ua-platform'] || 'unknown',
          mobile: req.headers['sec-ch-ua-mobile'] || '?0',
          acceptLanguage: req.headers['accept-language'],
          timestamp: new Date().toISOString()
        };

        await User.createSession(
          user.id,
          refreshToken,
          deviceInfo, // Now passing as object, not string
          req.ip || req.connection.remoteAddress,
          expiresAt
        );
      }

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user.id,
            email: user.email,
            user_type: user.user_type,
            email_verified: user.email_verified
          },
          profile,
          token,
          refreshToken: rememberMe ? refreshToken : undefined
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Error during login',
        error: error.message
      });
    }
  }

  // Refresh token
  static async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          message: 'Refresh token is required'
        });
      }

      // Verify refresh token
      const decoded = verifyToken(refreshToken);
      if (!decoded) {
        return res.status(401).json({
          success: false,
          message: 'Invalid refresh token'
        });
      }

      // Check if session exists
      const session = await User.findSession(refreshToken);
      if (!session) {
        return res.status(401).json({
          success: false,
          message: 'Session expired or invalid'
        });
      }

      // Get user
      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      // Generate new tokens
      const newToken = generateToken(user);
      const newRefreshToken = generateRefreshToken(user);

      // Delete old session and create new one
      await User.deleteSession(refreshToken);
      
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);
      
      // Format device info for new session
      const deviceInfo = {
        userAgent: req.headers['user-agent'],
        platform: req.headers['sec-ch-ua-platform'] || 'unknown',
        mobile: req.headers['sec-ch-ua-mobile'] || '?0',
        timestamp: new Date().toISOString()
      };
      
      await User.createSession(
        user.id,
        newRefreshToken,
        deviceInfo,
        req.ip || req.connection.remoteAddress,
        expiresAt
      );

      res.json({
        success: true,
        data: {
          token: newToken,
          refreshToken: newRefreshToken
        }
      });
    } catch (error) {
      console.error('Refresh token error:', error);
      res.status(500).json({
        success: false,
        message: 'Error refreshing token',
        error: error.message
      });
    }
  }

  // Logout
  static async logout(req, res) {
    try {
      const { refreshToken } = req.body;

      if (refreshToken) {
        await User.deleteSession(refreshToken);
      }

      res.json({
        success: true,
        message: 'Logout successful'
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        success: false,
        message: 'Error during logout',
        error: error.message
      });
    }
  }

  // Get current user
  // src/controllers/authController.js - Update getCurrentUser method

// Get current user
static async getCurrentUser(req, res) {
  try {
    console.log('Getting current user for ID:', req.user.id);
    
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get profile based on user type
    let profile = null;
    try {
      switch(user.user_type) {
        case 'enterprise':
          profile = await EnterpriseProfile.findByUserId(user.id);
          break;
        case 'seller':
          profile = await SellerProfile.findByUserId(user.id);
          break;
        default:
          profile = await UserProfile.findByUserId(user.id);
      }
    } catch (profileError) {
      console.error('Error fetching profile:', profileError);
      // Continue without profile if not found
    }

    console.log('Returning user data:', { user, profile });

    res.json({
      success: true,
      data: {
        user,
        profile: profile || null
      }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message
    });
  }
}
}

module.exports = AuthController;