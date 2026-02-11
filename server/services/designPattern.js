import DesignPattern from '../models/DesignPattern.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Design Pattern Engine
 * Converts image attributes into abstract design patterns
 * Generates alternative design recommendations
 */

class DesignPatternService {
    /**
     * Convert image attributes to design pattern
     */
    async createPatternFromAttributes(attributes) {
        const patternId = uuidv4();

        const pattern = await DesignPattern.create({
            patternId,
            name: this.generatePatternName(attributes),
            category: attributes.category,
            shape: attributes.shape,
            stoneDensity: attributes.stoneDensity,
            metalVisibility: attributes.metalVisibility,
            finish: attributes.finish,
            occasion: this.inferOccasion(attributes),
            style: this.inferStyle(attributes),
            tags: this.generateTags(attributes),
            isActive: true,
        });

        return pattern;
    }

    /**
     * Find matching design patterns
     */
    async findMatchingPatterns(attributes, limit = 1) {
        const query = {
            category: attributes.category,
            isActive: true,
        };

        // Add optional matching criteria
        if (attributes.shape) query.shape = attributes.shape;
        if (attributes.stoneDensity) query.stoneDensity = attributes.stoneDensity;

        const patterns = await DesignPattern.find(query).limit(limit);
        return patterns;
    }

    /**
     * Generate alternative design patterns
     * Creates 3-4 variations based on the original pattern
     */
    async generateAlternatives(baseAttributes, count = 3) {
        const alternatives = [];

        // Strategy 1: Same category, different shape
        if (count > 0) {
            alternatives.push(await this.createVariation(baseAttributes, 'shape'));
        }

        // Strategy 2: Same category, different stone density
        if (count > 1) {
            alternatives.push(await this.createVariation(baseAttributes, 'stoneDensity'));
        }

        // Strategy 3: Same category, different finish
        if (count > 2) {
            alternatives.push(await this.createVariation(baseAttributes, 'finish'));
        }

        // Strategy 4: Same category, different style combination
        if (count > 3) {
            alternatives.push(await this.createVariation(baseAttributes, 'mixed'));
        }

        return alternatives;
    }

    /**
     * Create a variation of the base pattern
     */
    async createVariation(baseAttributes, variationType) {
        const variation = { ...baseAttributes };

        switch (variationType) {
            case 'shape':
                variation.shape = this.getAlternativeShape(baseAttributes.shape);
                break;
            case 'stoneDensity':
                variation.stoneDensity = this.getAlternativeStoneDensity(baseAttributes.stoneDensity);
                break;
            case 'finish':
                variation.finish = this.getAlternativeFinish(baseAttributes.finish);
                break;
            case 'mixed':
                variation.shape = this.getAlternativeShape(baseAttributes.shape);
                variation.finish = this.getAlternativeFinish(baseAttributes.finish);
                break;
        }

        return variation;
    }

    // Helper methods for generating alternatives
    getAlternativeShape(currentShape) {
        const shapes = ['Round', 'Oval', 'Square', 'Heart', 'Pear', 'Marquise', 'Cushion'];
        const alternatives = shapes.filter(s => s !== currentShape);
        return alternatives[Math.floor(Math.random() * alternatives.length)];
    }

    getAlternativeStoneDensity(currentDensity) {
        const densities = ['None', 'Sparse', 'Medium', 'Dense'];
        const alternatives = densities.filter(d => d !== currentDensity);
        return alternatives[Math.floor(Math.random() * alternatives.length)];
    }

    getAlternativeFinish(currentFinish) {
        const finishes = ['Polished', 'Matte', 'Brushed', 'Textured', 'Mixed'];
        const alternatives = finishes.filter(f => f !== currentFinish);
        return alternatives[Math.floor(Math.random() * alternatives.length)];
    }

    // Pattern metadata generation
    generatePatternName(attributes) {
        return `${attributes.finish || ''} ${attributes.shape || ''} ${attributes.category || 'Jewellery'}`.trim();
    }

    inferOccasion(attributes) {
        if (attributes.stoneDensity === 'Dense') return 'Formal';
        if (attributes.stoneDensity === 'None') return 'Everyday';
        if (attributes.category === 'Ring') return 'Wedding';
        return 'Casual';
    }

    inferStyle(attributes) {
        if (attributes.finish === 'Polished' && attributes.stoneDensity === 'Dense') return 'Classic';
        if (attributes.finish === 'Matte') return 'Modern';
        if (attributes.stoneDensity === 'None') return 'Minimalist';
        return 'Modern';
    }

    generateTags(attributes) {
        const tags = [];
        if (attributes.category) tags.push(attributes.category.toLowerCase());
        if (attributes.shape) tags.push(attributes.shape.toLowerCase());
        if (attributes.finish) tags.push(attributes.finish.toLowerCase());
        if (attributes.stonePresence) tags.push('gemstone');
        return tags;
    }

    /**
     * Get pattern by ID
     */
    async getPatternById(patternId) {
        return await DesignPattern.findOne({ patternId });
    }

    /**
     * Search patterns by criteria
     */
    async searchPatterns(criteria) {
        const query = { isActive: true };

        if (criteria.category) query.category = criteria.category;
        if (criteria.shape) query.shape = criteria.shape;
        if (criteria.occasion) query.occasion = criteria.occasion;
        if (criteria.style) query.style = criteria.style;
        if (criteria.tags && criteria.tags.length > 0) {
            query.tags = { $in: criteria.tags };
        }

        return await DesignPattern.find(query);
    }
}

export default new DesignPatternService();
