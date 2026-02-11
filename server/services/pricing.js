import MarginConfig from '../models/MarginConfig.js';

/**
 * Pricing Service
 * Calculates platform-controlled price ranges with admin-configured margins
 * CRITICAL: External users NEVER see raw costs or supplier prices
 */

class PricingService {
    /**
     * Calculate price range for a product
     * Applies margin rules based on category, material, and price range
     */
    async calculatePriceRange(baseCost, category, material = null) {
        // Get applicable margin
        const margin = await this.getApplicableMargin(baseCost, category, material);

        // Calculate price with margin
        const basePrice = this.applyMargin(baseCost, margin);

        // Generate range (±10% from base price)
        const rangeVariation = 0.1;
        const minPrice = Math.round(basePrice * (1 - rangeVariation));
        const maxPrice = Math.round(basePrice * (1 + rangeVariation));

        return {
            min: minPrice,
            max: maxPrice,
            currency: 'INR',
            basePrice: Math.round(basePrice),
            marginApplied: margin,
        };
    }

    /**
     * Get applicable margin configuration
     * Priority: Category > Material > Price Range > Global
     */
    async getApplicableMargin(baseCost, category, material) {
        // Fetch all active margin configs sorted by priority
        const configs = await MarginConfig.find({ isActive: true }).sort({ priority: -1 });

        // Find best matching config
        for (const config of configs) {
            // Category-specific margin
            if (config.applicationType === 'Category' && config.category === category) {
                return config;
            }

            // Material-specific margin
            if (config.applicationType === 'Material' && config.material === material) {
                return config;
            }

            // Price range-specific margin
            if (
                config.applicationType === 'PriceRange' &&
                baseCost >= config.priceRange.min &&
                baseCost <= config.priceRange.max
            ) {
                return config;
            }

            // Global margin
            if (config.applicationType === 'Global') {
                return config;
            }
        }

        // Default margin if no config found
        return {
            name: 'Default Margin',
            marginType: 'Percentage',
            marginValue: parseFloat(process.env.DEFAULT_MARGIN_PERCENTAGE) || 30,
        };
    }

    /**
     * Apply margin to base cost
     */
    applyMargin(baseCost, marginConfig) {
        if (marginConfig.marginType === 'Percentage') {
            return baseCost * (1 + marginConfig.marginValue / 100);
        } else {
            // Fixed margin
            return baseCost + marginConfig.marginValue;
        }
    }

    /**
     * Calculate quotation line item pricing
     * Used by sales team when generating quotations
     */
    async calculateQuotationLineItem(baseCost, quantity, category, material) {
        const priceRange = await this.calculatePriceRange(baseCost, category, material);

        const unitPrice = priceRange.basePrice;
        const totalPrice = unitPrice * quantity;

        return {
            baseCost,
            quantity,
            unitPrice,
            totalPrice,
            marginApplied: {
                marginType: priceRange.marginApplied.marginType,
                percentage: priceRange.marginApplied.marginValue,
                amount: unitPrice - baseCost,
            },
        };
    }

    /**
     * Calculate total quotation pricing
     */
    async calculateQuotationTotal(lineItems) {
        let subtotal = 0;
        let totalMargin = 0;

        for (const item of lineItems) {
            subtotal += item.baseCost * item.quantity;
            totalMargin += (item.unitPrice - item.baseCost) * item.quantity;
        }

        const grandTotal = subtotal + totalMargin;

        return {
            subtotal,
            totalMargin,
            grandTotal,
            averageMarginPercentage: subtotal > 0 ? (totalMargin / subtotal) * 100 : 0,
        };
    }

    /**
     * Validate price range for external display
     * Ensures no sensitive data is exposed
     */
    sanitizePriceForExternal(priceData) {
        return {
            min: priceData.min,
            max: priceData.max,
            currency: priceData.currency,
            // NEVER include: baseCost, marginApplied, basePrice
        };
    }
}

export default new PricingService();
