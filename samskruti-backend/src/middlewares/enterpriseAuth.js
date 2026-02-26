const jwt = require('jsonwebtoken');
const Enterprise = require('../models/Enterprise');

const authenticateEnterprise = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        
        if (decoded.type !== 'enterprise') {
            return res.status(403).json({
                success: false,
                message: 'Invalid token type'
            });
        }

        const enterprise = await Enterprise.findById(decoded.id);
        
        if (!enterprise) {
            return res.status(401).json({
                success: false,
                message: 'Enterprise not found'
            });
        }

        if (enterprise.verification_status !== 'approved') {
            return res.status(403).json({
                success: false,
                message: 'Account not approved yet'
            });
        }

        req.enterprise = enterprise;
        next();
    } catch (error) {
        console.error('Authentication error:', error);
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token'
        });
    }
};

module.exports = { authenticateEnterprise };