const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const User = require('../models/User');
const UserProfile = require('../models/UserProfile');
const Enterprise = require('../models/Enterprise');
const Seller = require('../models/Seller');

class AuthController {
  // Register new user
  async register(req, res) {
    const client = await db.pool.connect();
    
    try {
      await client.query('BEGIN');
      
      const { email, password, userType } = req.body;
      
      console.log('Registration attempt for:', email, 'type:', userType);
      
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
      const hashedPassword = await bcrypt.hash(password, salt);
      
      // Create user - setting BOTH role and user_type for consistency
      const userResult = await client.query(
        `INSERT INTO users (email, password_hash, role, user_type, is_active, is_verified, created_at, updated_at)
         VALUES ($1, $2, $3, $3, $4, $5, NOW(), NOW())
         RETURNING id, email, role, user_type, is_active, is_verified, created_at`,
        [email, hashedPassword, userType, true, userType === 'user' ? true : false]
      );
      
      const user = userResult.rows[0];
      console.log('User created:', user.id, 'with role:', user.role, 'and user_type:', user.user_type);
      
      // Create profile based on user type
      if (userType === 'user') {
        // Create user profile
        const { name, phone, dateOfBirth, gender, city, state } = req.body;
        
        await client.query(
          `INSERT INTO user_profiles 
           (user_id, full_name, phone, date_of_birth, gender, city, state, country, preferred_language, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())`,
          [user.id, name || '', phone || '', dateOfBirth || null, gender || null, city || null, state || null, 'India', 'English']
        );
        
      } else if (userType === 'enterprise') {
        // Create enterprise profile
        const {
          companyName,
          ownerName,
          businessType,
          companyDescription,
          contactPhone,
          companyWebsite,
          registrationNumber, gstNumber, panNumber,
          establishedYear, employeeCount,
          contactPerson, companyAddress, companyCity,
          companyState, companyPincode
        } = req.body;
        
        console.log('Creating enterprise with data:', {
          enterprise_name: companyName,
          owner_name: ownerName,
          business_type: businessType
        });
        
        // Handle document uploads
        const verification_documents = {};
        const business_documents = {};
        const tax_documents = {};
        const bank_details = {};
        
        if (req.files) {
          if (req.files.registrationCert) {
            business_documents.registrationCert = req.files.registrationCert[0].path;
          }
          if (req.files.gstCert) {
            tax_documents.gstCert = req.files.gstCert[0].path;
          }
          if (req.files.panCard) {
            tax_documents.panCard = req.files.panCard[0].path;
          }
          if (req.files.addressProof) {
            verification_documents.addressProof = req.files.addressProof[0].path;
          }
          if (req.files.bankStatement) {
            bank_details.bankStatement = req.files.bankStatement[0].path;
          }
        }
        
        // Build address/location
        const location = [companyAddress, companyCity, companyState, companyPincode]
          .filter(Boolean)
          .join(', ');
        
        await client.query(
          `INSERT INTO enterprises 
           (user_id, enterprise_name, owner_name, business_type, description, location,
            phone, website, verification_status, verification_documents, business_documents,
            tax_documents, bank_details, submitted_at, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW(), NOW())
           RETURNING id`,
          [user.id, 
           companyName || '', 
           ownerName || contactPerson || '', 
           businessType || '', 
           companyDescription || '', 
           location || '',
           contactPhone || '', 
           companyWebsite || '', 
           'pending',
           JSON.stringify(verification_documents),
           JSON.stringify(business_documents),
           JSON.stringify(tax_documents),
           JSON.stringify(bank_details)
          ]
        );
        
        console.log('Enterprise profile created for user:', user.id);
        
      } else if (userType === 'seller') {
        // Create seller profile
        const {
          shopName, ownerName, shopType, sellerPhone, sellerAlternatePhone,
          shopAddress, sellerCity, sellerState, sellerPincode, establishedYear,
          businessDescription, productCategories, gstNumber, panNumber,
          bankAccountNumber, bankIfscCode, bankName
        } = req.body;
        
        console.log('Creating seller with data:', {
          shop_name: shopName,
          owner_name: ownerName
        });
        
        // Parse product categories
        let categories = [];
        if (productCategories) {
          try {
            categories = typeof productCategories === 'string' 
              ? JSON.parse(productCategories) 
              : (Array.isArray(productCategories) ? productCategories : []);
          } catch (e) {
            categories = [];
          }
        }
        
        // Build address
        const address = [shopAddress, sellerCity, sellerState, sellerPincode]
          .filter(Boolean)
          .join(', ');
        
        // Prepare verification documents
        const verification_documents = {};
        if (req.files) {
          if (req.files.identityProof) {
            verification_documents.identityProof = req.files.identityProof[0].path;
          }
          if (req.files.addressProof) {
            verification_documents.addressProof = req.files.addressProof[0].path;
          }
        }
        
        // Prepare bank details
        const bank_details = {
          account_number: bankAccountNumber,
          ifsc_code: bankIfscCode,
          bank_name: bankName
        };
        
        await client.query(
          `INSERT INTO sellers 
           (user_id, shop_name, owner_name, shop_type, phone, alternate_phone,
            shop_address, business_description, product_categories, gst_number, pan_number,
            bank_details, verification_status, verification_documents, submitted_at, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW(), NOW())
           RETURNING id`,
          [user.id, 
           shopName || '', 
           ownerName || '', 
           shopType || '', 
           sellerPhone || '', 
           sellerAlternatePhone || '',
           address || '', 
           businessDescription || '', 
           categories, 
           gstNumber || '', 
           panNumber || '',
           JSON.stringify(bank_details),
           'pending',
           JSON.stringify(verification_documents)
          ]
        );
        
        console.log('Seller profile created for user:', user.id);
      }
      
      await client.query('COMMIT');
      
      // Generate JWT token with BOTH role and user_type
      const token = jwt.sign(
        { 
          id: user.id, 
          email: user.email, 
          role: user.role,
          user_type: user.user_type || user.role
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );
      
      // Return success
      res.status(201).json({
        success: true,
        message: userType === 'user' 
          ? 'User registered successfully' 
          : 'Registration submitted for approval',
        data: {
          user,
          token
        }
      });
      
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Registration failed',
        error: error.message
      });
    } finally {
      client.release();
    }
  }
  
  // Login user - FIXED VERSION
  async login(req, res) {
    try {
      const { email, password, rememberMe } = req.body;
      
      console.log('Login attempt for:', email);
      
      // Find user
      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }
      
      // Check password
      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }
      
      // Check if user is active
      if (!user.is_active) {
        return res.status(403).json({
          success: false,
          message: 'Account is deactivated. Please contact support.'
        });
      }
      
      // Determine the actual user type/role (check both fields)
      const actualUserType = user.role || user.user_type || 'user';
      console.log('User type from DB - role:', user.role, 'user_type:', user.user_type, 'using:', actualUserType);
      
      // Check verification status for enterprise/seller and determine redirect path
      let redirectTo = null;
      let profileComplete = false;
      let profile = null;
      
      if (actualUserType === 'enterprise') {
        const enterpriseQuery = await db.query(
          'SELECT * FROM enterprises WHERE user_id = $1',
          [user.id]
        );
        profile = enterpriseQuery.rows[0];
        
        if (profile) {
          if (profile.verification_status === 'approved') {
            redirectTo = '/enterprise/dashboard';
            profileComplete = true;
            console.log('Enterprise approved, redirecting to:', redirectTo);
          } else {
            console.log('Enterprise not approved, status:', profile.verification_status);
            return res.status(403).json({
              success: false,
              message: `Your enterprise account is ${profile.verification_status}. Please wait for approval.`,
              redirectTo: '/auth/pending-approval'
            });
          }
        } else {
          // No profile found, treat as pending
          return res.status(403).json({
            success: false,
            message: 'Your enterprise profile is not complete. Please contact support.',
            redirectTo: '/auth/pending-approval'
          });
        }
      } else if (actualUserType === 'seller') {
        const sellerQuery = await db.query(
          'SELECT * FROM sellers WHERE user_id = $1',
          [user.id]
        );
        profile = sellerQuery.rows[0];
        
        if (profile) {
          if (profile.verification_status === 'approved') {
            redirectTo = '/seller/dashboard';
            profileComplete = true;
            console.log('Seller approved, redirecting to:', redirectTo);
          } else {
            console.log('Seller not approved, status:', profile.verification_status);
            return res.status(403).json({
              success: false,
              message: `Your seller account is ${profile.verification_status}. Please wait for approval.`,
              redirectTo: '/auth/pending-approval'
            });
          }
        } else {
          return res.status(403).json({
            success: false,
            message: 'Your seller profile is not complete. Please contact support.',
            redirectTo: '/auth/pending-approval'
          });
        }
      } else if (actualUserType === 'admin') {
        redirectTo = '/admin/dashboard';
        profileComplete = true;
        console.log('Admin login, redirecting to:', redirectTo);
      } else {
        // Regular user
        redirectTo = '/dashboard';
        profileComplete = true;
        console.log('Regular user, redirecting to:', redirectTo);
      }
      
      // Update last login
      try {
        await User.updateLastLogin(user.id);
      } catch (loginError) {
        console.log('Note: Could not update last login');
      }
      
      // Generate token with BOTH role and user_type
      const tokenExpiry = rememberMe ? '30d' : (process.env.JWT_EXPIRES_IN || '7d');
      const token = jwt.sign(
        { 
          id: user.id, 
          email: user.email, 
          role: actualUserType,
          user_type: actualUserType
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: tokenExpiry }
      );
      
      // Create user object for response
      const userResponse = {
        id: user.id,
        email: user.email,
        role: actualUserType,
        user_type: actualUserType,
        is_active: user.is_active,
        is_verified: user.is_verified,
        last_login: user.last_login,
        created_at: user.created_at
      };
      
      console.log('Login successful for:', email, 'role:', actualUserType, 'redirecting to:', redirectTo);
      
      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: userResponse,
          token,
          profile,
          redirectTo,
          profileComplete
        }
      });
      
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Login failed',
        error: error.message
      });
    }
  }
  
  // Refresh token
  async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;
      
      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          message: 'Refresh token is required'
        });
      }
      
      // Verify refresh token
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'your-refresh-secret');
      
      // Find user
      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      // Check if user is active
      if (!user.is_active) {
        return res.status(403).json({
          success: false,
          message: 'Account is deactivated'
        });
      }
      
      // Determine actual user type
      const actualUserType = user.role || user.user_type || 'user';
      
      // Generate new access token
      const newToken = jwt.sign(
        { 
          id: user.id, 
          email: user.email, 
          role: actualUserType,
          user_type: actualUserType
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );
      
      res.json({
        success: true,
        data: {
          token: newToken
        }
      });
      
    } catch (error) {
      console.error('Refresh token error:', error);
      
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          message: 'Invalid refresh token'
        });
      }
      
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Refresh token expired'
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to refresh token',
        error: error.message
      });
    }
  }
  
  // Logout
  async logout(req, res) {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      
      if (token) {
        // Optional: Blacklist the token
      }
      
      res.json({
        success: true,
        message: 'Logged out successfully'
      });
      
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        success: false,
        message: 'Logout failed',
        error: error.message
      });
    }
  }
  
  // Get current user
  async getCurrentUser(req, res) {
    try {
      const user = await User.findById(req.user.id);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      // Determine actual user type
      const actualUserType = user.role || user.user_type || 'user';
      
      // Get profile based on user type
      let profile = null;
      if (actualUserType === 'enterprise') {
        const profileQuery = await db.query(
          'SELECT * FROM enterprises WHERE user_id = $1',
          [user.id]
        );
        profile = profileQuery.rows[0];
      } else if (actualUserType === 'seller') {
        const profileQuery = await db.query(
          'SELECT * FROM sellers WHERE user_id = $1',
          [user.id]
        );
        profile = profileQuery.rows[0];
      } else {
        const profileQuery = await db.query(
          'SELECT * FROM user_profiles WHERE user_id = $1',
          [user.id]
        );
        profile = profileQuery.rows[0];
      }
      
      // Create user response
      const userResponse = {
        id: user.id,
        email: user.email,
        role: actualUserType,
        user_type: actualUserType,
        is_active: user.is_active,
        is_verified: user.is_verified,
        last_login: user.last_login,
        created_at: user.created_at
      };
      
      res.json({
        success: true,
        data: {
          user: userResponse,
          profile
        }
      });
      
    } catch (error) {
      console.error('Get current user error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get user data',
        error: error.message
      });
    }
  }
}

// Export an instance of the class
module.exports = new AuthController();