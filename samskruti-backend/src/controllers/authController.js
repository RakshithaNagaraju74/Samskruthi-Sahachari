// controllers/authController.js
const User = require('../models/User');
const UserProfile = require('../models/UserProfile');
const Enterprise = require('../models/Enterprise');
const SellerProfile = require('../models/SellerProfile');
const { generateToken, generateRefreshToken, verifyToken } = require('../utils/generateToken');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');

class AuthController {
  // Register new user
  static async register(req, res) {
    try {
      console.log('Registration request body:', req.body);
      
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const { email, password, user_type, ...profileData } = req.body;

      // Validate required fields
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email and password are required'
        });
      }

      // Check if user already exists
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User with this email already exists'
        });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(password, salt);

      // Create user with hashed password
      const user = await User.create({
        email,
        password_hash,
        role: user_type || 'user'
      });

      console.log('User created:', user);

      // Create profile based on user type
      let profile;
      switch(user_type) {
        case 'enterprise':
          profile = await Enterprise.create({
            user_id: user.id,
            company_name: profileData.company_name,
            registration_number: profileData.registration_number,
            gst_number: profileData.gst_number,
            contact_person: profileData.contact_person,
            contact_email: profileData.contact_email,
            contact_phone: profileData.contact_phone,
            address: profileData.address,
            city: profileData.city,
            state: profileData.state,
            pincode: profileData.pincode,
            website: profileData.website,
            description: profileData.description,
            logo_url: profileData.logo_url
          });
          break;
        case 'seller':
          profile = await SellerProfile.create({
            user_id: user.id,
            shop_name: profileData.shop_name,
            owner_name: profileData.owner_name,
            shop_type: profileData.shop_type,
            gst_number: profileData.gst_number,
            pan_number: profileData.pan_number,
            phone: profileData.phone,
            alternate_phone: profileData.alternate_phone,
            email: profileData.email,
            website: profileData.website,
            shop_address: profileData.shop_address,
            city: profileData.city,
            state: profileData.state,
            pincode: profileData.pincode,
            established_year: profileData.established_year,
            business_description: profileData.business_description,
            product_categories: profileData.product_categories,
            shop_images: profileData.shop_images,
            documents: profileData.documents
          });
          break;
        default: // 'user' or any other type
          profile = await UserProfile.create({
            user_id: user.id,
            full_name: profileData.full_name,
            phone: profileData.phone,
            date_of_birth: profileData.date_of_birth,
            gender: profileData.gender,
            profile_image: profileData.profile_image,
            city: profileData.city,
            state: profileData.state,
            country: profileData.country,
            preferred_language: profileData.preferred_language,
            interests: profileData.interests
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
            user_type: user.role
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
      console.log('Login request body:', req.body);
      
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const { email, password, rememberMe } = req.body;

      // Validate required fields
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email and password are required'
        });
      }

      // Find user
      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      console.log('User found:', { id: user.id, email: user.email, role: user.role });

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
      let profile = null;
      try {
        switch(user.role) {
          case 'enterprise':
            profile = await Enterprise.findByUserId(user.id);
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

      // Generate tokens
      const token = generateToken(user);
      const refreshToken = generateRefreshToken(user);

      // Create session if remember me is checked
      if (rememberMe) {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

        // Format device info as an object
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
          deviceInfo,
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
            user_type: user.role,
            email_verified: user.is_verified
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
        switch(user.role) {
          case 'enterprise':
            profile = await Enterprise.findByUserId(user.id);
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