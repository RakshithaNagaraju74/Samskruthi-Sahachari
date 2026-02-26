const express = require('express');
const router = express.Router();
const Enterprise = require('../models/Enterprise');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/enterprise-documents';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|pdf/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Only .pdf, .jpg, .jpeg, .png files are allowed'));
    }
});

// Register enterprise
router.post('/register', upload.fields([
    { name: 'registrationCert', maxCount: 1 },
    { name: 'gstCert', maxCount: 1 },
    { name: 'panCard', maxCount: 1 },
    { name: 'addressProof', maxCount: 1 },
    { name: 'bankStatement', maxCount: 1 }
]), async (req, res) => {
    try {
        const documents = {};
        if (req.files) {
            Object.keys(req.files).forEach(key => {
                documents[key] = req.files[key][0].path;
            });
        }

        const enterpriseData = {
            ...req.body,
            documents
        };

        // Check if email already exists
        const existing = await Enterprise.findByEmail(req.body.email);
        if (existing) {
            return res.status(400).json({
                success: false,
                message: 'Email already registered'
            });
        }

        const enterprise = await Enterprise.create(enterpriseData);

        // Generate JWT token
        const token = jwt.sign(
            { id: enterprise.id, email: enterprise.email, type: 'enterprise' },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '7d' }
        );

        res.status(201).json({
            success: true,
            message: 'Enterprise registration submitted for approval',
            data: {
                enterprise,
                token
            }
        });
    } catch (error) {
        console.error('Enterprise registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Registration failed',
            error: error.message
        });
    }
});

// Login enterprise
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const enterprise = await Enterprise.login(email, password);
        
        if (!enterprise) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Check verification status
        if (enterprise.verification_status !== 'approved') {
            return res.status(403).json({
                success: false,
                message: `Your account is ${enterprise.verification_status}. Please wait for approval.`,
                redirectTo: '/auth/pending-approval'
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: enterprise.id, email: enterprise.email, type: 'enterprise' },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '7d' }
        );

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                enterprise,
                token
            }
        });
    } catch (error) {
        console.error('Enterprise login error:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed'
        });
    }
});

module.exports = router;