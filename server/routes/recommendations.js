import express from 'express';
import { protect, sanitizeSupplierData } from '../middleware/auth.js';
import recommendationService from '../services/recommendation.js';
import imageProcessingService from '../services/imageProcessing.js';
import pricingService from '../services/pricing.js';

const router = express.Router();

/**
 * @route   POST /api/recommendations/generate
 * @desc    Generate recommendations from image session
 * @access  Private (External users)
 */
router.post('/generate', protect, sanitizeSupplierData, async (req, res) => {
    try {
        const { sessionId } = req.body;

        if (!sessionId) {
            return res.status(400).json({
                success: false,
                message: 'Session ID is required',
            });
        }

        // Get image session
        const session = await imageProcessingService.getSession(sessionId);

        if (!session) {
            return res.status(404).json({
                success: false,
                message: 'Image session not found',
            });
        }

        // Verify ownership
        if (session.userId.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to access this session',
            });
        }

        if (session.status !== 'Completed') {
            return res.status(400).json({
                success: false,
                message: 'Image processing not completed',
            });
        }

        // Generate recommendations
        const recommendations = await recommendationService.generateRecommendations(session);

        // Sanitize for external users (remove sensitive data)
        const sanitizedRecommendations = recommendations.map(rec => {
            const sanitized = { ...rec };

            if (req.sanitizeForExternal) {
                // Remove internal pricing details
                if (sanitized.priceRange) {
                    sanitized.priceRange = pricingService.sanitizePriceForExternal(sanitized.priceRange);
                }
            }

            return sanitized;
        });

        res.status(200).json({
            success: true,
            data: {
                sessionId,
                recommendations: sanitizedRecommendations,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

/**
 * @route   GET /api/recommendations/:recommendationId
 * @desc    Get recommendation details
 * @access  Private
 */
router.get('/:recommendationId', protect, sanitizeSupplierData, async (req, res) => {
    try {
        const recommendation = await recommendationService.getRecommendationDetails(
            req.params.recommendationId
        );

        if (!recommendation) {
            return res.status(404).json({
                success: false,
                message: 'Recommendation not found',
            });
        }

        // Sanitize for external users
        if (req.sanitizeForExternal && recommendation.priceRange) {
            recommendation.priceRange = pricingService.sanitizePriceForExternal(
                recommendation.priceRange
            );
        }

        res.status(200).json({
            success: true,
            data: recommendation,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

export default router;
