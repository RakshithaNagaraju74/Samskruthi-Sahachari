console.log("✅ Seller Routes File Loaded");

const express = require('express');
const router = express.Router();
const sellerAuth = require('../../middlewares/sellerAuth');
const upload = require('../../utils/upload');
const { authMiddleware } = require('../../middlewares/authMiddleware');
// At the top of sellerRoutes.js, right after defining the router
router.get('/test-public', (req, res) => {
  res.json({ success: true, message: 'Public test works' });
});
// Import controllers
const SellerController = require('../../controllers/seller/SellerController');
const ProductController = require('../../controllers/seller/ProductController');
const OrderController = require('../../controllers/seller/OrderController');
const ReviewController = require('../../controllers/seller/ReviewController');
const PayoutController = require('../../controllers/seller/PayoutController');
const CouponController = require('../../controllers/seller/CouponController');
const NotificationController = require('../../controllers/seller/NotificationController'); // NEW

// ==================== Dashboard Routes ====================
router.get('/dashboard/overview', sellerAuth, SellerController.getDashboardOverview);
router.get('/dashboard/stats', sellerAuth, SellerController.getStats);

// ==================== Profile Routes ====================
router.get('/profile', sellerAuth, SellerController.getProfile);
router.put('/profile', sellerAuth, SellerController.updateProfile);
router.post('/profile/logo', sellerAuth, upload.sellerLogo.single('logo'), SellerController.uploadLogo);
router.post('/profile/banner', sellerAuth, upload.sellerBanner.single('banner'), SellerController.uploadBanner);

// ==================== Notification Routes ====================
router.get('/notifications', sellerAuth, NotificationController.getNotifications);
router.put('/notifications/:id/read', sellerAuth, NotificationController.markAsRead);

// ==================== Product Routes ====================
router.get('/products', sellerAuth, ProductController.getProducts);
router.get('/products/low-stock', sellerAuth, ProductController.getLowStock);
router.get('/products/:id', sellerAuth, ProductController.getProduct);
router.post('/products', sellerAuth, upload.productImages.array('images', 10), ProductController.createProduct);
router.put('/products/:id', sellerAuth, upload.productImages.array('images', 10), ProductController.updateProduct);
router.delete('/products/:id', sellerAuth, ProductController.deleteProduct);
router.patch('/products/:id/status', sellerAuth, ProductController.updateStatus);
router.patch('/products/:id/quantity', sellerAuth, ProductController.updateQuantity);

// ==================== Order Routes ====================
router.get('/orders', sellerAuth, OrderController.getOrders);
router.get('/orders/stats', sellerAuth, OrderController.getOrderStats);
router.get('/orders/:id', sellerAuth, OrderController.getOrder);
router.put('/orders/:id/status', sellerAuth, OrderController.updateOrderStatus);

// ==================== Analytics Routes ====================
router.get('/analytics/earnings', sellerAuth, SellerController.getEarnings);

// ==================== Review Routes ====================
router.get('/reviews', sellerAuth, ReviewController.getReviews);
router.get('/reviews/:id', sellerAuth, ReviewController.getReview);
router.put('/reviews/:id/status', sellerAuth, ReviewController.updateReviewStatus);
router.post('/reviews', authMiddleware, ReviewController.createReview);

// ==================== Payout Routes ====================
router.get('/payouts', sellerAuth, PayoutController.getPayouts);
router.get('/payouts/:id', sellerAuth, PayoutController.getPayout);
router.post('/payouts/request', sellerAuth, PayoutController.requestPayout);

// ==================== Coupon Routes ====================
router.get('/coupons', sellerAuth, CouponController.getCoupons);
router.get('/coupons/:id', sellerAuth, CouponController.getCoupon);
router.post('/coupons', sellerAuth, CouponController.createCoupon);
router.put('/coupons/:id', sellerAuth, CouponController.updateCoupon);
router.delete('/coupons/:id', sellerAuth, CouponController.deleteCoupon);

// ==================== Inventory Logs ====================
router.get('/inventory/logs', sellerAuth, require('../../controllers/seller/InventoryController').getLogs);

module.exports = router;