import express from 'express';
import multer from 'multer';
import path from 'path';
import { protect } from '../middleware/auth.js';
import imageProcessingService from '../services/imageProcessing.js';
import { auditLogger } from '../middleware/auditLogger.js';

const router = express.Router();

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, process.env.UPLOAD_PATH || './uploads');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, 'jewellery-' + uniqueSuffix + path.extname(file.originalname));
    },
});

const fileFilter = (req, file, cb) => {
    // Accept images only
    if (!file.mimetype.startsWith('image/')) {
        return cb(new Error('Only image files are allowed'), false);
    }
    cb(null, true);
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB
    },
});

/**
 * @route   POST /api/images/upload
 * @desc    Upload and process jewellery image
 * @access  Private (External users)
 */
router.post(
    '/upload',
    protect,
    upload.single('image'),
    auditLogger('Upload Image', 'ImageSession'),
    async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'Please upload an image file',
                });
            }

            const session = await imageProcessingService.processImage(req.file, req.user.id);

            res.status(201).json({
                success: true,
                data: session,
                message: 'Image processed successfully',
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }
);

/**
 * @route   GET /api/images/session/:id
 * @desc    Get image session details
 * @access  Private
 */
router.get('/session/:id', protect, async (req, res) => {
    try {
        const session = await imageProcessingService.getSession(req.params.id);

        if (!session) {
            return res.status(404).json({
                success: false,
                message: 'Session not found',
            });
        }

        // Verify ownership (except for Sales/Sourcing/Admin)
        if (
            req.user.role === 'External' &&
            session.userId.toString() !== req.user.id
        ) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to access this session',
            });
        }

        res.status(200).json({
            success: true,
            data: session,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

/**
 * @route   DELETE /api/images/session/:id
 * @desc    Delete image session
 * @access  Private
 */
router.delete('/session/:id', protect, async (req, res) => {
    try {
        const session = await imageProcessingService.getSession(req.params.id);

        if (!session) {
            return res.status(404).json({
                success: false,
                message: 'Session not found',
            });
        }

        // Verify ownership
        if (session.userId.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this session',
            });
        }

        session.status = 'Deleted';
        session.deletedAt = new Date();
        await session.save();

        res.status(200).json({
            success: true,
            message: 'Session deleted successfully',
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

export default router;
