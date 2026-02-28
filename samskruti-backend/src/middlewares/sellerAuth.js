const jwt = require('jsonwebtoken');
const db = require('../config/database');

const sellerAuthMiddleware = async (req, res, next) => {
    console.log('\n========== SELLER AUTH DEBUG ==========');
    
    try {
        // 1. Check token
        const authHeader = req.header('Authorization');
        console.log('1. Auth Header:', authHeader ? 'Present' : 'Missing');
        
        const token = authHeader?.replace('Bearer ', '');
        console.log('2. Token extracted:', token ? 'Yes' : 'No');
        
        if (!token) {
            console.log('❌ No token provided');
            return res.status(401).json({ 
                success: false,
                message: 'Authentication required' 
            });
        }

        // 2. Verify token
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log('3. Token decoded:', {
                id: decoded.id,
                email: decoded.email,
                user_type: decoded.user_type
            });
        } catch (err) {
            console.log('❌ Token verification failed:', err.message);
            return res.status(401).json({ 
                success: false,
                message: 'Invalid token' 
            });
        }

        // 3. Get user from database with correct join condition
        console.log('4. Looking up user ID:', decoded.id);
        
        const result = await db.query(
            `SELECT u.*, s.id as seller_id, s.status as seller_status, s.shop_name,
                    s.owner_name, s.phone, s.email as seller_email, s.shop_address
             FROM users u 
             LEFT JOIN sellers s ON u.id = s.user_id  -- Fixed: using user_id, not id
             WHERE u.id = $1`,
            [decoded.id]
        );

        console.log('5. Query executed. Row count:', result.rows.length);
        
        if (result.rows.length === 0) {
            console.log('❌ User not found in database for ID:', decoded.id);
            return res.status(401).json({ 
                success: false,
                message: 'User not found' 
            });
        }

        const user = result.rows[0];
        console.log('6. User from DB:', {
            id: user.id,
            email: user.email,
            user_type: user.user_type,
            seller_id: user.seller_id,
            seller_status: user.seller_status,
            shop_name: user.shop_name
        });

        // 4. Check if seller profile exists
        if (!user.seller_id) {
            console.log('❌ No seller profile linked to this user');
            
            // Debug: Check if seller record exists but join failed
            const sellerCheck = await db.query(
                'SELECT * FROM sellers WHERE user_id = $1',
                [decoded.id]
            );
            
            if (sellerCheck.rows.length > 0) {
                console.log('⚠️ Seller record EXISTS but join failed! Check your database schema.');
                console.log('   Seller record:', sellerCheck.rows[0]);
                console.log('   The join condition should be: users.id = sellers.user_id');
            } else {
                console.log('ℹ️ No seller record found for user_id:', decoded.id);
                console.log('   You need to create a seller profile for this user.');
            }
            
            return res.status(403).json({ 
                success: false,
                message: 'Seller account required. Please create a seller profile first.' 
            });
        }

        // 5. Check if seller account is active
        if (user.seller_status !== 'active') {
            console.log('❌ Seller account not active. Status:', user.seller_status);
            return res.status(403).json({ 
                success: false,
                message: `Your seller account is ${user.seller_status}. Please contact support.` 
            });
        }

        // 6. Set user info in request
        req.user = {
            id: user.id,
            email: user.email,
            user_type: user.user_type
        };
        
        req.sellerId = user.seller_id;
        req.seller = {
            id: user.seller_id,
            shop_name: user.shop_name,
            owner_name: user.owner_name,
            phone: user.phone,
            email: user.seller_email,
            address: user.shop_address,
            status: user.seller_status
        };
        
        console.log('✅ Authentication successful for seller:', user.shop_name);
        console.log('   Seller ID:', user.seller_id);
        console.log('=========================================\n');
        
        next();

    } catch (error) {
        console.error('❌ Seller auth error:', error);
        console.error('Error stack:', error.stack);
        console.log('=========================================\n');
        
        res.status(500).json({ 
            success: false,
            message: 'Server error during authentication'
        });
    }
};

module.exports = sellerAuthMiddleware;