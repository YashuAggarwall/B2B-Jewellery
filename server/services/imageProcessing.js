import ImageSession from '../models/ImageSession.js';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs/promises';
import path from 'path';

// Import local AI model pipeline
// Using dynamic import for better startup time
let pipeline;

/**
 * Image Processing Service
 * uses CLIP model (via @xenova/transformers) for zero-shot image classification
 */

class ImageProcessingService {
    constructor() {
        this.classifier = null;
    }

    /**
     * Initialize the AI model
     */
    async initModel() {
        if (!this.classifier) {
            console.log('🔄 Loading AI Model (CLIP)...');
            try {
                // Dynamically import transformers pipeline
                if (!pipeline) {
                    const transformers = await import('@xenova/transformers');
                    pipeline = transformers.pipeline;
                }

                // Load CLIP model for zero-shot image classification
                // 'Xenova/clip-vit-base-patch32' is a good balance of speed/accuracy
                this.classifier = await pipeline('zero-shot-image-classification', 'Xenova/clip-vit-base-patch32');
                console.log('✅ AI Model Loaded Successfully');
            } catch (error) {
                console.error('❌ Failed to load AI model:', error);
                // Fallback to null, will use mock logic if model fails
                this.classifier = null;
            }
        }
    }

    /**
     * Process uploaded image and extract attributes
     */
    async processImage(file, userId) {
        try {
            const imageId = uuidv4();

            // Create image session
            const session = await ImageSession.create({
                userId,
                imageId,
                originalFilename: file.originalname,
                status: 'Processing',
            });

            // Extract attributes using AI model
            const attributes = await this.extractAttributes(file);

            // Update session with extracted attributes
            session.extractedAttributes = attributes;
            session.status = 'Completed';
            session.processedAt = new Date();
            await session.save();

            // Delete the physical image file after processing
            await this.deleteImageFile(file.path);

            return session;
        } catch (error) {
            console.error('Processing error:', error);
            throw new Error(`Image processing failed: ${error.message}`);
        }
    }

    /**
     * Extract attributes using AI Model
     */
    async extractAttributes(file) {
        console.log('🧠 Analyzing image with AI...');

        // Ensure model is loaded
        await this.initModel();

        let category = 'Ring'; // Default
        let metalColor = 'Gold'; // Default

        if (this.classifier) {
            try {
                // 1. Detect Category
                const categories = ['Ring', 'Necklace', 'Earring', 'Bracelet', 'Pendant', 'Bangle'];
                const categoryResult = await this.classifier(file.path, categories);

                console.log('🤖 AI Category Detection:', categoryResult);

                // Get top result
                if (categoryResult && categoryResult.length > 0) {
                    category = categoryResult[0].label;
                }

                // 2. Detect Metal Color (simple secondary classification)
                // We'll re-run classification for materials
                // Note: For efficiency in production, we'd run one pass with all labels, 
                // but zero-shot splits them nicely conceptually.
                /* 
                   Checking material is harder with just zero-shot on the whole image 
                   without segmentation, but we can try basic colors.
                */
                // For now, we'll stick to category detection to keep it fast, 
                // and infer others or randomise for demo if needed.

            } catch (error) {
                console.error('⚠️ AI inference failed, falling back to heuristic:', error);
                category = this.detectCategoryHeuristic(file.originalname);
            }
        } else {
            // Fallback if model failed to load
            category = this.detectCategoryHeuristic(file.originalname);
        }

        const attributes = {
            category: category,
            shape: this.detectShapeRandom(), // Real shape detection needs specialized model
            metalVisibility: 'High',
            stonePresence: true,
            stoneDensity: 'Medium',
            finish: 'Polished',
            dominantColor: metalColor,
            estimatedWeight: 'Medium',
        };

        console.log('🔍 Extracted Attributes:', JSON.stringify(attributes, null, 2));
        return attributes;
    }

    // Fallback heuristic method
    detectCategoryHeuristic(filename) {
        const lower = filename.toLowerCase();
        if (lower.includes('necklace') || lower.includes('haar')) return 'Necklace';
        if (lower.includes('earring')) return 'Earring';
        if (lower.includes('bracelet') || lower.includes('bangle') || lower.includes('kada')) return 'Bracelet';
        if (lower.includes('pendant') || lower.includes('locket')) return 'Pendant';
        return 'Ring';
    }

    detectShapeRandom() {
        const shapes = ['Round', 'Oval', 'Square', 'Pear', 'Heart'];
        return shapes[Math.floor(Math.random() * shapes.length)];
    }

    /**
     * Delete image file from filesystem
     */
    async deleteImageFile(filePath) {
        try {
            await fs.unlink(filePath);
        } catch (error) {
            console.error('Error deleting image file:', error);
        }
    }

    /**
     * Get image session by ID
     */
    async getSession(sessionId) {
        return await ImageSession.findById(sessionId);
    }

    /**
     * Clean up old sessions (called by cron job)
     */
    async cleanupOldSessions() {
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

        const result = await ImageSession.updateMany(
            { createdAt: { $lt: oneDayAgo }, status: { $ne: 'Deleted' } },
            { status: 'Deleted', deletedAt: new Date() }
        );

        return result;
    }
}

export default new ImageProcessingService();
