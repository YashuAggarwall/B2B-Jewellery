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
    async asyncInitModel() {
        // If AI is explicitly disabled, don't even try to load it (saves ~300MB RAM)
        if (process.env.DISABLE_AI === 'true') {
            console.log('ℹ️ AI Model is DISABLED via environment variable.');
            this.classifier = null;
            return;
        }

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
                this.classifier = await pipeline('zero-shot-image-classification', 'Xenova/clip-vit-base-patch32', {
                    quantized: true, // Use quantized model to save memory
                });
                console.log('✅ AI Model Loaded Successfully');
            } catch (error) {
                console.error('❌ Failed to load AI model (likely Memory/OOM):', error);
                // Fallback to null, will use heuristic logic
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
        console.log('🧠 Analyzing image...');

        // Ensure model is loaded (only if not disabled)
        await this.asyncInitModel();

        let category = 'Ring'; // Default
        let metalColor = 'Gold'; // Default
        let isAiEstimated = false;

        if (this.classifier) {
            try {
                console.log('🤖 Running AI classification...');
                // 1. Detect Category
                const categories = ['Ring', 'Necklace', 'Earring', 'Bracelet', 'Pendant', 'Bangle'];
                const categoryResult = await this.classifier(file.path, categories);

                console.log('🤖 AI Category Detection:', categoryResult);

                // Get top result
                if (categoryResult && categoryResult.length > 0) {
                    category = categoryResult[0].label;
                    isAiEstimated = true;
                }

            } catch (error) {
                console.error('⚠️ AI inference failed (Memory Limit?), falling back to heuristic:', error);
                category = this.detectCategoryHeuristic(file.originalname);
            }
        } else {
            // Fallback if model failed to load or is disabled
            console.log('ℹ️ Using heuristic fallback for categorization.');
            category = this.detectCategoryHeuristic(file.originalname);
        }

        const attributes = {
            category: category,
            shape: this.detectShapeRandom(),
            metalVisibility: 'High',
            stonePresence: true,
            stoneDensity: 'Medium',
            finish: 'Polished',
            dominantColor: metalColor,
            estimatedWeight: 'Medium',
            isAiEstimated: isAiEstimated,
            processingMethod: isAiEstimated ? 'AI (CLIP)' : 'Heuristic (Fallback)'
        };

        console.log('🔍 Final Attributes:', JSON.stringify(attributes, null, 2));
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
