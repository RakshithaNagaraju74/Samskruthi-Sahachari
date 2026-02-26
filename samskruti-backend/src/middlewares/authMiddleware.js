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
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    // Add user info to request
    req.user = decoded;
    
    // Debug log
    console.log('Auth middleware - Decoded user:', {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      user_type: decoded.user_type
    });
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({
      success: false,
      message: 'Not authorized'
    });
  }
};

// Role-based authorization middleware - UPDATED to check both role and user_type
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      console.log('Authorize failed: No user in request');
      return res.status(401).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Check both possible role fields
    const userRole = req.user.role || req.user.user_type;
    
    console.log('Authorize check:', {
      requiredRoles: roles,
      userRole: userRole,
      hasRole: roles.includes(userRole)
    });

    if (!roles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to perform this action'
      });
    }

    next();
  };
};

module.exports = {
  authMiddleware,
  authorize
};