// middlewares/checkUserType.js

/**
 * Middleware to check if user has one of the allowed user types
 * @param {Array} allowedTypes - Array of allowed user types (e.g., ['admin', 'enterprise', 'user'])
 * @returns {Function} Express middleware
 */
const checkUserType = (allowedTypes) => {
    return (req, res, next) => {
        try {
            // Check if user exists in request (should be added by authMiddleware)
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Not authenticated'
                });
            }

            // Check if user type is in allowed types
            if (!allowedTypes.includes(req.user.user_type)) {
                return res.status(403).json({
                    success: false,
                    message: `Access denied. Required user type: ${allowedTypes.join(' or ')}`
                });
            }

            // User has required type, proceed to next middleware
            next();
        } catch (error) {
            console.error('Error in checkUserType middleware:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    };
};

/**
 * Middleware to check if user is an admin
 * @returns {Function} Express middleware
 */
const isAdmin = () => {
    return checkUserType(['admin']);
};

/**
 * Middleware to check if user is an enterprise
 * @returns {Function} Express middleware
 */
const isEnterprise = () => {
    return checkUserType(['enterprise']);
};

/**
 * Middleware to check if user is a regular user
 * @returns {Function} Express middleware
 */
const isUser = () => {
    return checkUserType(['user']);
};

/**
 * Middleware to check if user is a seller
 * @returns {Function} Express middleware
 */
const isSeller = () => {
    return checkUserType(['seller']);
};

module.exports = {
    checkUserType,
    isAdmin,
    isEnterprise,
    isUser,
    isSeller
};