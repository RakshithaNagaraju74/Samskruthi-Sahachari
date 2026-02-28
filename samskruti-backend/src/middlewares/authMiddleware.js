const { verifyToken } = require('../utils/generateToken');

const authMiddleware = async (req, res, next) => {
  try {
    let token;

    // Check Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this resource'
      });
    }

    // Verify token
    const decoded = verifyToken(token);
    console.log("🔍 DECODED TOKEN:", decoded);
    
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    // Add user info to request
    req.user = decoded;
    
    // Debug log with both role fields
    console.log('✅ Auth middleware - User authenticated:', {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      user_type: decoded.user_type
    });
    
    next();
  } catch (error) {
    console.error('❌ Auth middleware error:', error);
    res.status(401).json({
      success: false,
      message: 'Not authorized'
    });
  }
};

// Role-based authorization middleware - checks both role and user_type
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      console.log('❌ Authorize failed: No user in request');
      return res.status(401).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Check both possible role fields (role or user_type)
    const userRole = req.user.role || req.user.user_type;
    
    console.log('🔑 Authorize check:', {
      requiredRoles: roles,
      userRole: userRole,
      roleField: req.user.role ? 'role' : (req.user.user_type ? 'user_type' : 'none'),
      hasRole: roles.includes(userRole)
    });

    if (!userRole || !roles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to perform this action'
      });
    }

    next();
  };
};

// Specific role checkers for common use cases
const authorizeAdmin = authorize('admin', 'superadmin');
const authorizeEnterprise = authorize('enterprise', 'enterprise_admin');
const authorizeSeller = authorize('seller', 'vendor');
const authorizeUser = authorize('user', 'customer', 'visitor');

module.exports = {
  authMiddleware,
  authorize,
  // Export specific role checkers for convenience
  authorizeAdmin,
  authorizeEnterprise,
  authorizeSeller,
  authorizeUser
};