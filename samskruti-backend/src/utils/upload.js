const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create upload directories if they don't exist
const createUploadDirs = () => {
    const dirs = [
        'uploads/sellers/logos',
        'uploads/sellers/banners',
        'uploads/sellers/products',
        'uploads/sellers/documents'
    ];
    
    dirs.forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    });
};

createUploadDirs();

// Storage for product images
const productStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/sellers/products');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'product-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Storage for seller logos
const logoStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/sellers/logos');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'logo-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Storage for seller banners
const bannerStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/sellers/banners');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'banner-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter for images
const imageFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Only image files are allowed'));
    }
};

// File filter for documents
const documentFilter = (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    
    if (extname) {
        return cb(null, true);
    } else {
        cb(new Error('Only PDF and DOC files are allowed'));
    }
};

// Export different upload configurations
const upload = {
    productImages: multer({
        storage: productStorage,
        limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
        fileFilter: imageFilter
    }),
    
    sellerLogo: multer({
        storage: logoStorage,
        limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
        fileFilter: imageFilter
    }),
    
    sellerBanner: multer({
        storage: bannerStorage,
        limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
        fileFilter: imageFilter
    }),
    
    documents: multer({
        storage: multer.diskStorage({
            destination: (req, file, cb) => {
                cb(null, 'uploads/sellers/documents');
            },
            filename: (req, file, cb) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                cb(null, 'doc-' + uniqueSuffix + path.extname(file.originalname));
            }
        }),
        limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
        fileFilter: documentFilter
    })
};

module.exports = upload;