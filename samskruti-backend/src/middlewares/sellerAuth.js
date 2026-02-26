const jwt = require('jsonwebtoken');
const Seller = require('../models/Seller');

const authenticateSeller = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        
        if (decoded.type !== 'seller') {
            return res.status(403).json({
                success: false,
                message: 'Invalid token type'
            });
        }

        const seller = await Seller.findById(decoded.id);
        
        if (!seller) {
            return res.status(401).json({
                success: false,
                message: 'Seller not found'
            });
        }

        if (seller.verification_status !== 'approved') {
            return res.status(403).json({
                success: false,
                message: 'Account not approved yet'
            });
        }

        if (seller.status !== 'active') {
            return res.status(403).json({
                success: false,
                message: 'Account is inactive'
            });
        }

        req.seller = seller;
        next();
    } catch (error) {
        console.error('Authentication error:', error);
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token'
        });
    }
};

module.exports = { authenticateSeller };