const SellerModel = require('../../models/seller/SellerModel');
const ProductModel = require('../../models/seller/ProductModel');
const OrderModel = require('../../models/seller/OrderModel');

class SellerController {
    // Dashboard Overview
    static async getDashboardOverview(req, res) {
        try {
            const sellerId = req.sellerId;
            
            const [profile, stats, earnings] = await Promise.all([
                SellerModel.getProfile(sellerId),
                SellerModel.getDashboardStats(sellerId),
                SellerModel.getEarnings(sellerId)
            ]);

            res.json({
                success: true,
                data: {
                    seller: {
                        id: profile.id,
                        shop_name: profile.shop_name,
                        owner_name: profile.owner_name,
                        logo: profile.logo,
                        rating: profile.rating,
                        verified: profile.verified,
                        status: profile.status
                    },
                    overview: {
                        today_orders: stats.today.orders,
                        today_revenue: stats.today.revenue,
                        total_orders: stats.total.orders,
                        total_revenue: stats.total.revenue,
                        total_customers: stats.total.customers,
                        total_products: stats.products.total,
                        published_products: stats.products.published,
                        pending_orders: stats.pending_orders,
                        low_stock_products: stats.products.low_stock,
                        out_of_stock: stats.products.out_of_stock
                    },
                    earnings: {
                        total: parseFloat(earnings.total_earnings),
                        commission: parseFloat(earnings.total_commission),
                        net: parseFloat(earnings.net_earnings),
                        paid: parseFloat(earnings.paid_earnings),
                        pending: parseFloat(earnings.pending_earnings)
                    },
                    recent_orders: stats.recent_orders,
                    monthly_revenue: stats.monthly_revenue
                }
            });
        } catch (error) {
            console.error('Dashboard overview error:', error);
            res.status(500).json({ 
                success: false,
                message: 'Failed to load dashboard data' 
            });
        }
    }

    // Get Seller Profile
    static async getProfile(req, res) {
        try {
            const sellerId = req.sellerId;
            const profile = await SellerModel.getProfile(sellerId);
            
            if (!profile) {
                return res.status(404).json({ 
                    success: false,
                    message: 'Seller profile not found' 
                });
            }

            res.json({
                success: true,
                data: profile
            });
        } catch (error) {
            console.error('Get profile error:', error);
            res.status(500).json({ 
                success: false,
                message: 'Failed to load profile' 
            });
        }
    }

    // Update Seller Profile
    static async updateProfile(req, res) {
        try {
            const sellerId = req.sellerId;
            const updatedProfile = await SellerModel.updateProfile(sellerId, req.body);
            
            res.json({
                success: true,
                message: 'Profile updated successfully',
                data: updatedProfile
            });
        } catch (error) {
            console.error('Update profile error:', error);
            res.status(500).json({ 
                success: false,
                message: 'Failed to update profile' 
            });
        }
    }

    // Upload Logo
    static async uploadLogo(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({ 
                    success: false,
                    message: 'No file uploaded' 
                });
            }

            const sellerId = req.sellerId;
            const logoPath = req.file.path;
            
            const result = await SellerModel.updateLogo(sellerId, logoPath);
            
            res.json({
                success: true,
                message: 'Logo uploaded successfully',
                data: { logo: result.logo }
            });
        } catch (error) {
            console.error('Upload logo error:', error);
            res.status(500).json({ 
                success: false,
                message: 'Failed to upload logo' 
            });
        }
    }

    // Upload Banner
    static async uploadBanner(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({ 
                    success: false,
                    message: 'No file uploaded' 
                });
            }

            const sellerId = req.sellerId;
            const bannerPath = req.file.path;
            
            const result = await SellerModel.updateBanner(sellerId, bannerPath);
            
            res.json({
                success: true,
                message: 'Banner uploaded successfully',
                data: { banner: result.banner }
            });
        } catch (error) {
            console.error('Upload banner error:', error);
            res.status(500).json({ 
                success: false,
                message: 'Failed to upload banner' 
            });
        }
    }

    // Get Seller Stats
    static async getStats(req, res) {
        try {
            const sellerId = req.sellerId;
            const stats = await SellerModel.getDashboardStats(sellerId);
            const earnings = await SellerModel.getEarnings(sellerId);
            
            res.json({
                success: true,
                data: {
                    ...stats,
                    earnings
                }
            });
        } catch (error) {
            console.error('Get stats error:', error);
            res.status(500).json({ 
                success: false,
                message: 'Failed to load statistics' 
            });
        }
    }

    // Get Earnings
    static async getEarnings(req, res) {
        try {
            const sellerId = req.sellerId;
            const earnings = await SellerModel.getEarnings(sellerId);
            
            // Get payout history
            const payouts = await db.query(
                'SELECT * FROM seller_payouts WHERE seller_id = $1 ORDER BY created_at DESC LIMIT 10',
                [sellerId]
            );
            
            res.json({
                success: true,
                data: {
                    ...earnings,
                    payouts: payouts.rows
                }
            });
        } catch (error) {
            console.error('Get earnings error:', error);
            res.status(500).json({ 
                success: false,
                message: 'Failed to load earnings' 
            });
        }
    }
}

module.exports = SellerController;