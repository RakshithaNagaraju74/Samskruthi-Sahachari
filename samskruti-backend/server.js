// server.js (with temporary fix)
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes = require('./src/routes/authRoutes');
const userRoutes = require('./src/routes/userRoutes');
const heritageRoutes = require('./src/routes/heritageRoutes');
const ticketRoutes = require('./src/routes/ticketRoutes');
const bookingRoutes = require('./src/routes/bookingRoutes');
const messageRoutes = require('./src/routes/messageRoutes');
const enterpriseRoutes = require('./src/routes/enterpriseRoutes');
const notificationRoutes = require('./src/routes/notificationRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const groqRoutes = require('./src/routes/groqRoutes');
require('./src/utils/notificationCron'); // Start cron jobs

// Import admin routes
let verificationRoutes;
try {
    verificationRoutes = require('./src/routes/admin/verificationRoutes');
    console.log('✅ Verification routes loaded');
} catch (error) {
    console.error('❌ Error loading verification routes:', error.message);
    verificationRoutes = express.Router();
    verificationRoutes.get('/', (req, res) => res.json({ message: 'Verification routes placeholder' }));
}

// Import enterprise dashboard routes
let enterpriseDashboardRoutes;
try {
    enterpriseDashboardRoutes = require('./src/routes/enterprise/dashboardRoutes');
    console.log('✅ Enterprise dashboard routes loaded');
} catch (error) {
    console.error('❌ Error loading enterprise dashboard routes:', error.message);
    enterpriseDashboardRoutes = express.Router();
    enterpriseDashboardRoutes.get('/', (req, res) => res.json({ message: 'Enterprise dashboard placeholder' }));
}

// Import seller dashboard routes
let sellerDashboardRoutes;
try {
    sellerDashboardRoutes = require('./src/routes/seller/dashboardRoutes');
    console.log('✅ Seller dashboard routes loaded');
} catch (error) {
    console.error('❌ Error loading seller dashboard routes:', error.message);
    sellerDashboardRoutes = express.Router();
    sellerDashboardRoutes.get('/', (req, res) => res.json({ message: 'Seller dashboard placeholder' }));
}

const app = express();

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { success: false, message: 'Too many requests, please try again later' }
});

// CORS configuration
const corsOptions = {
    origin: process.env.NODE_ENV === 'production' 
        ? ['https://yourdomain.com'] 
        : ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
    optionsSuccessStatus: 200
};

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cors(corsOptions));
app.use(limiter);

// Request logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/heritage', heritageRoutes);
app.use('/api/tickets', ticketRoutes);
require('./src/utils/cronJobs');
app.use('/api/bookings', bookingRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/groq', groqRoutes);
app.use('/api/enterprise', enterpriseRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/admin/verification', verificationRoutes);
app.use('/api/enterprises', enterpriseDashboardRoutes);
app.use('/api/seller', sellerDashboardRoutes);
app.use('/api/admin', adminRoutes);
// Add this after all your app.use() statements
app.use('/api/enterprise', (req, res, next) => {
    console.log('🔍 Enterprise route hit:', req.method, req.path);
    next();
}, enterpriseRoutes);

// Log all registered routes (add this after all routes are mounted)
function printRoutes() {
    console.log('\n📋 Registered Routes:');
    const routes = [];
    
    app._router.stack.forEach((middleware) => {
        if (middleware.route) {
            // Routes registered directly
            const methods = Object.keys(middleware.route.methods);
            routes.push({
                path: middleware.route.path,
                methods: methods.join(', ').toUpperCase()
            });
        } else if (middleware.name === 'router') {
            // Router middleware
            middleware.handle.stack.forEach((handler) => {
                if (handler.route) {
                    const path = handler.route.path;
                    const methods = Object.keys(handler.route.methods);
                    const fullPath = middleware.regexp.source
                        .replace('\\/?(?=\\/|$)', '')
                        .replace(/\\/g, '')
                        .replace('^', '');
                    
                    routes.push({
                        path: fullPath + path,
                        methods: methods.join(', ').toUpperCase()
                    });
                }
            });
        }
    });
    
    routes.sort((a, b) => a.path.localeCompare(b.path));
    routes.forEach(route => {
        console.log(`   ${route.methods.padEnd(8)} ${route.path}`);
    });
    console.log('');
}

// Call this after a short delay to ensure all routes are registered
setTimeout(printRoutes, 1000);

// Health check
app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Root route
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Samskruthi Sahaachari API',
        version: '1.0.0',
        endpoints: {
            auth: {
                register: 'POST /api/auth/register/:userType',
                login: 'POST /api/auth/login',
                refreshToken: 'POST /api/auth/refresh-token',
                logout: 'POST /api/auth/logout',
                me: 'GET /api/auth/me'
            },
            user: {
                profile: 'GET /api/user/profile',
                updateProfile: 'PUT /api/user/profile',
                bookings: 'GET /api/user/bookings',
                tickets: 'GET /api/user/tickets',
                wishlist: 'GET /api/user/wishlist',
                visits: 'GET /api/user/visits',
                reviews: 'GET /api/user/reviews'
            },
            heritage: {
                sites: 'GET /api/heritage/sites',
                site: 'GET /api/heritage/sites/:id',
                search: 'GET /api/heritage/search',
                unesco: 'GET /api/heritage/unesco',
                featured: 'GET /api/heritage/featured',
                nearby: 'GET /api/heritage/nearby',
                reviews: 'GET /api/heritage/sites/:id/reviews'
            },
            tickets: {
                create: 'POST /api/tickets/create',
                verify: 'POST /api/tickets/verify',
                user: 'GET /api/tickets/user/:userId',
                ticket: 'GET /api/tickets/:ticketNumber'
            },
            health: 'GET /health'
        }
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
        path: req.originalUrl
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal server error';
    
    res.status(statusCode).json({
        success: false,
        message,
        error: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
    process.exit(1);
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
    });
});

module.exports = app;