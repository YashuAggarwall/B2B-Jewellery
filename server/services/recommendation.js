import InventoryItem from '../models/InventoryItem.js';
import ManufacturerSKU from '../models/ManufacturerSKU.js';
import externalSourcingService from './externalSourcing.js';
import pricingService from './pricing.js';

/**
 * Recommendation Engine
 * CRITICAL BUSINESS LOGIC - Implements sourcing priority rules
 * 
 * RULES (NON-NEGOTIABLE):
 * 1. Every recommendation tile (primary + alternatives) follows same priority
 * 2. ALWAYS check internal inventory FIRST
 * 3. ONLY if no inventory match → check Alibaba (internal only)
 * 4. Alibaba price is input cost only - never shown to external users
 * 5. Final price is PLATFORM-CONTROLLED RANGE
 */

class RecommendationService {
    /**
     * Generate recommendations from image session
     * Returns 1 primary + 3-4 alternatives
     */
    async generateRecommendations(imageSession) {
        const recommendations = [];
        const usedItemIds = new Set(); // Track already-used items

        // 1. Generate PRIMARY recommendation
        const primary = await this.generatePrimaryRecommendation(imageSession.extractedAttributes);
        recommendations.push({ ...primary, type: 'Primary', position: 1 });

        // Track the primary item to avoid duplicates
        if (primary.sourceId) {
            usedItemIds.add(primary.sourceId.toString());
        }

        // 2. Generate ALTERNATIVE recommendations (3-4)
        const alternatives = await this.generateAlternativeRecommendations(
            imageSession.extractedAttributes,
            3,
            usedItemIds // Pass used IDs to avoid duplicates
        );

        alternatives.forEach((alt, index) => {
            recommendations.push({ ...alt, type: 'Alternative', position: index + 2 });
        });

        return recommendations;
    }

    /**
     * Get recommendation details by ID
     * Handles both database-backed (inventory/manufacturer) and generic recommendations
     * Used by cart service to validate recommendations before adding to cart
     */
    async getRecommendationDetails(recommendationId, productDetails = null) {
        // Ensure ID is clean
        recommendationId = recommendationId?.trim();

        console.log('🔍 Looking up recommendation:', recommendationId);
        console.log('📝 Product Details provided:', !!productDetails);

        // Check for External/Transient items causing "Not Found" errors
        if (recommendationId.startsWith('ext-')) {
            console.log('🌐 External recommendation detected');

            if (productDetails) {
                console.log('✅ Using provided product details for external item');
                return {
                    ...productDetails,
                    recommendationId,
                    sourceType: 'External'
                };
            }

            console.error('❌ CRITICAL: Missing product details for external item:', recommendationId);
            console.log('⚠️  Attempting to reconstruct/fallback (unsafe)');

            // Should verify if we can recover or genuinely fail
            return null;
        }

        // Check if it's a generic recommendation (temporary ID)
        if (recommendationId.startsWith('gen-')) {
            console.log('✅ Generic recommendation detected');

            // Extract attributes from ID or use defaults to get a placeholder image
            // format: gen-Category-Shape-Finish
            const parts = recommendationId.split('-');
            const category = parts[1] || 'Ring';
            const placeholder = this.getPlaceholderImages(category)[0];

            return {
                recommendationId,
                sourceType: 'Generic',
                sourceId: null,
                name: 'Custom Order',
                category: category,
                imageUrl: placeholder,
                images: [placeholder],
                priceRange: {
                    min: 5000,
                    max: 50000,
                    currency: 'INR'
                }
            };
        }

        // Check inventory items
        if (recommendationId.startsWith('inv-')) {
            console.log('🔍 Checking inventory...');
            const inventoryId = recommendationId.replace('inv-', '');
            const item = await InventoryItem.findById(inventoryId);

            if (item) {
                console.log('✅ Inventory item found:', item.name);
                const priceRange = await pricingService.calculatePriceRange(
                    item.baseCost,
                    item.category,
                    item.material.metal
                );

                return {
                    recommendationId,
                    sourceType: 'Inventory',
                    sourceId: item._id,
                    name: item.name,
                    category: item.category,
                    imageUrl: item.images && item.images.length > 0 ? item.images[0] : (item.imageUrl || null),
                    images: item.images && item.images.length > 0 ? item.images : (item.imageUrl ? [item.imageUrl] : []),
                    priceRange
                };
            }
            console.log('❌ Inventory item not found');
        }

        // Check manufacturer SKUs
        if (recommendationId.startsWith('mfg-')) {
            console.log('🔍 Checking manufacturer...');
            const mfgId = recommendationId.replace('mfg-', '');
            const sku = await ManufacturerSKU.findById(mfgId);

            if (sku) {
                console.log('✅ Manufacturer SKU found:', sku.name);
                // Fallback to 'Gold' if metal is not specified to prevent NaN
                const metal = sku.material?.metal || 'Gold';

                const priceRange = await pricingService.calculatePriceRange(
                    sku.baseCost, // Fixed: was sku.unitCost, should be sku.baseCost
                    sku.category,
                    metal
                );

                // Use actual stored images - return as array to match frontend expectations
                let images;
                if (sku.imageUrl) {
                    images = [sku.imageUrl];
                } else if (sku.images && sku.images.length > 0) {
                    images = sku.images;
                } else {
                    images = [];
                }

                const availability = sku.supplierName || 'Made to Order';

                return {
                    recommendationId,
                    sourceType: 'Manufacturer',
                    sourceId: sku._id,
                    name: sku.name,
                    category: sku.category,
                    imageUrl: images[0] || null,
                    images, // Return as array, not imageUrl
                    availability,
                    priceRange
                };
            }
            console.log('❌ Manufacturer SKU not found');
        }

        // Recommendation not found
        console.log('❌ Recommendation not found:', recommendationId);
        return null;
    }

    /**
     * Generate PRIMARY recommendation
     * Applies sourcing priority logic
     */
    async generatePrimaryRecommendation(attributes) {
        console.log('🎯 Generating PRIMARY recommendation for:', attributes);

        // STEP 1: Check internal inventory FIRST
        const inventoryMatch = await this.findInventoryMatch(attributes);

        if (inventoryMatch) {
            console.log('✅ INVENTORY MATCH FOUND:', inventoryMatch.name);
            return await this.buildRecommendationFromInventory(inventoryMatch);
        }
        console.log('❌ No inventory match found');

        // STEP 2: No inventory match → check Alibaba (internal only)
        const manufacturerMatch = await this.findManufacturerMatch(attributes);

        if (manufacturerMatch) {
            console.log('✅ MANUFACTURER MATCH FOUND:', manufacturerMatch.name);
            return await this.buildRecommendationFromManufacturer(manufacturerMatch);
        }
        console.log('❌ No manufacturer match found');

        // STEP 3: No match found - return generic recommendation
        console.log('⚠️  Falling back to GENERIC recommendation');
        return this.buildGenericRecommendation(attributes);
    }

    /**
     * Generate ALTERNATIVE recommendations
     * PRIORITY: 1. Inventory items → 2. Manufacturer SKUs → 3. External API
     * Excludes already-used items to prevent duplicates
     */
    async generateAlternativeRecommendations(baseAttributes, count = 3, excludeIds = new Set()) {
        const alternatives = [];

        console.log(`🔍 Searching for ${count} alternative recommendations...`);

        // STEP 1: Search inventory for multiple matching items
        const inventoryItems = await this.findMultipleInventoryMatches(
            baseAttributes,
            count,
            excludeIds
        );

        console.log(`✅ Found ${inventoryItems.length} items in inventory`);

        // Add inventory items to alternatives
        for (const item of inventoryItems) {
            alternatives.push(await this.buildRecommendationFromInventory(item));
            excludeIds.add(item._id.toString());
        }

        // STEP 2: If we don't have enough alternatives, search manufacturer SKUs
        let remaining = count - alternatives.length;
        if (remaining > 0) {
            console.log(`🏭 Inventory has ${alternatives.length}/${count} items. Searching manufacturer SKUs for ${remaining} more...`);
            const manufacturerSKUs = await this.findMultipleManufacturerMatches(
                baseAttributes,
                remaining,
                excludeIds
            );

            console.log(`✅ Found ${manufacturerSKUs.length} manufacturer SKUs`);

            // Add manufacturer SKUs to alternatives
            for (const sku of manufacturerSKUs) {
                alternatives.push(await this.buildRecommendationFromManufacturer(sku));
                excludeIds.add(sku._id.toString());
            }
        }

        // STEP 3: If we still don't have enough alternatives, call external API
        remaining = count - alternatives.length;
        if (remaining > 0) {
            console.log(`🌐 Have ${alternatives.length}/${count} items. Calling external API for ${remaining} more...`);
            const externalResults = await externalSourcingService.search(baseAttributes, remaining);
            alternatives.push(...externalResults);
        } else {
            console.log(`✅ Internal sources provided all ${count} alternatives. No external API call needed.`);
        }

        return alternatives;
    }

    /**
     * Find multiple matching items in internal inventory
     * Used for generating alternative recommendations
     * Excludes items in excludeIds to prevent duplicates
     */
    async findMultipleInventoryMatches(attributes, count, excludeIds = new Set()) {
        const query = {
            category: attributes.category,
            isAvailable: true,
            stockQuantity: { $gt: 0 }
        };

        // Exclude already-used items
        if (excludeIds.size > 0) {
            query._id = { $nin: Array.from(excludeIds) };
        }

        // Find multiple items from inventory
        const items = await InventoryItem.find(query).limit(count);
        return items;
    }

    /**
     * Find multiple matching manufacturer SKUs
     * Used for generating alternative recommendations
     * Excludes items in excludeIds to prevent duplicates
     */
    async findMultipleManufacturerMatches(attributes, count, excludeIds = new Set()) {
        const query = {
            category: attributes.category,
            isApproved: true,
            isActive: true,
        };

        // Exclude already-used items
        if (excludeIds.size > 0) {
            query._id = { $nin: Array.from(excludeIds) };
        }

        // Find multiple SKUs from manufacturers
        const skus = await ManufacturerSKU.find(query)
            .select('-supplierIdInternal -alibabaProductId') // Keep supplierName for display, exclude sensitive data
            .limit(count);

        return skus;
    }

    /**
     * Find matching item in internal inventory
     * Uses two-tier matching: first try exact match with shape, then fallback to category only
     * Excludes items in excludeIds to prevent duplicates
     */
    async findInventoryMatch(attributes, excludeIds = new Set()) {
        // TIER 1: Try to find exact match with shape
        if (attributes.shape) {
            const exactQuery = {
                category: attributes.category,
                isAvailable: true,
                stockQuantity: { $gt: 0 },
                'specifications.shape': attributes.shape,
            };

            // Exclude already-used items
            if (excludeIds.size > 0) {
                exactQuery._id = { $nin: Array.from(excludeIds).map(id => id) };
            }

            const exactMatches = await InventoryItem.find(exactQuery).limit(1);
            if (exactMatches.length > 0) {
                return exactMatches[0];
            }
        }

        // TIER 2: Fallback to category-only match
        const categoryQuery = {
            category: attributes.category,
            isAvailable: true,
            stockQuantity: { $gt: 0 },
        };

        // Exclude already-used items
        if (excludeIds.size > 0) {
            categoryQuery._id = { $nin: Array.from(excludeIds).map(id => id) };
        }

        const categoryMatches = await InventoryItem.find(categoryQuery).limit(1);
        return categoryMatches.length > 0 ? categoryMatches[0] : null;
    }

    /**
     * Find matching manufacturer SKU (Alibaba - internal only)
     * Excludes items in excludeIds to prevent duplicates
     */
    async findManufacturerMatch(attributes, excludeIds = new Set()) {
        const query = {
            category: attributes.category,
            isApproved: true,
            isActive: true,
        };

        // Add optional matching criteria
        if (attributes.shape) {
            query['specifications.shape'] = attributes.shape;
        }

        // Exclude already-used items
        if (excludeIds.size > 0) {
            query._id = { $nin: Array.from(excludeIds).map(id => id) };
        }

        const matches = await ManufacturerSKU.find(query)
            .select('-supplierIdInternal -alibabaProductId') // Keep supplierName for display, exclude sensitive data
            .limit(1);

        return matches.length > 0 ? matches[0] : null;
    }

    /**
     * Build recommendation from inventory item
     */
    async buildRecommendationFromInventory(inventoryItem) {
        // Calculate platform price range with margins
        const priceRange = await pricingService.calculatePriceRange(
            inventoryItem.baseCost,
            inventoryItem.category,
            inventoryItem.material.metal
        );

        return {
            recommendationId: `inv-${inventoryItem._id}`,
            sourceType: 'Inventory',
            sourceId: inventoryItem._id,
            name: inventoryItem.name,
            description: inventoryItem.description,
            category: inventoryItem.category,
            images: inventoryItem.images,
            priceRange, // Platform-controlled range
            availability: 'In Stock',
            leadTime: '3-5 days',
            moq: inventoryItem.minOrderQuantity || 1,
            customizationAvailable: false,
            // NEVER include: supplier info, raw costs, internal SKUs
        };
    }

    /**
     * Build recommendation from manufacturer SKU
     * CRITICAL: Supplier details are NEVER exposed except supplier name for display
     */
    async buildRecommendationFromManufacturer(manufacturerSKU) {
        // Calculate platform price range with margins
        // Fallback to 'Gold' if metal is not specified to prevent NaN
        const metal = manufacturerSKU.material?.metal || 'Gold';

        const priceRange = await pricingService.calculatePriceRange(
            manufacturerSKU.baseCost,
            manufacturerSKU.category,
            metal
        );

        // Use actual stored images if available, fallback to placeholder
        let images;
        if (manufacturerSKU.imageUrl) {
            images = [manufacturerSKU.imageUrl];
        } else if (manufacturerSKU.images && manufacturerSKU.images.length > 0) {
            images = manufacturerSKU.images;
        } else {
            images = this.getPlaceholderImages(manufacturerSKU.category);
        }

        // Show supplier name in availability for better context
        const availability = manufacturerSKU.supplierName || 'Made to Order';

        return {
            recommendationId: `mfg-${manufacturerSKU._id}`,
            sourceType: 'Manufacturer',
            sourceId: manufacturerSKU._id,
            name: manufacturerSKU.name,
            description: manufacturerSKU.description,
            category: manufacturerSKU.category,
            images,
            priceRange, // Platform-controlled range (NOT Alibaba price)
            availability,
            leadTime: `${manufacturerSKU.leadTimeDays} days`,
            moq: manufacturerSKU.moq,
            customizationAvailable: manufacturerSKU.customizationScope !== 'None',
            customizationOptions: manufacturerSKU.customizationScope !== 'None'
                ? manufacturerSKU.customizationOptions
                : null,
            // CRITICAL: NO internal supplier IDs, NO Alibaba details, NO raw costs
        };
    }

    /**
     * Build generic recommendation when no match found
     */
    buildGenericRecommendation(attributes) {
        const placeholderImages = this.getPlaceholderImages(attributes.category);
        const priceRange = this.getGenericPriceRange(attributes);

        // Generate a more descriptive and unique name
        const finish = attributes.finish ? attributes.finish + ' ' : '';
        const shape = attributes.shape ? attributes.shape + ' ' : '';
        const density = attributes.stoneDensity && attributes.stoneDensity !== 'None' ? 'Gemstone ' : '';

        const name = `${finish}${density}${shape}${attributes.category || 'Jewellery'}`.trim();

        return {
            recommendationId: `gen-${Date.now()}-${Math.random()}`,
            sourceType: 'Generic',
            sourceId: null,
            name: name,
            description: `Custom ${attributes.finish || ''} design available upon request`,
            category: attributes.category,
            images: placeholderImages,
            priceRange,
            availability: 'Custom Order',
            leadTime: '15-20 days',
            moq: 1,
            customizationAvailable: true,
        };
    }

    /**
     * Get realistic price range for generic recommendations based on category and attributes
     */
    getGenericPriceRange(attributes) {
        const category = attributes.category;

        // Category-specific price ranges based on typical jewellery costs
        const priceRanges = {
            'Ring': { min: 8000, max: 25000 },
            'Necklace': { min: 30000, max: 80000 },
            'Earring': { min: 12000, max: 35000 },
            'Bracelet': { min: 20000, max: 60000 },
            'Pendant': { min: 10000, max: 30000 },
        };

        const range = priceRanges[category] || { min: 5000, max: 15000 };

        // --- Dynamic Modifiers ---
        let multiplier = 1.0;

        // 1. Density/Stone Modifier
        if (attributes.stoneDensity === 'High' || attributes.stoneDensity === 'Medium') {
            multiplier += 0.45; // Significant bump for gemstone-heavy designs
        } else if (attributes.stoneDensity === 'Low') {
            multiplier += 0.15;
        }

        // 2. Finish Modifier
        if (attributes.finish === 'Polished' || attributes.finish === 'High Polish') {
            multiplier += 0.05;
        } else if (attributes.finish === 'Textured') {
            multiplier += 0.1;
        }

        // 3. Complexity/Attributes deterministic jitter
        // We use the attributes string to create a consistent but "random-looking" variance
        const attrString = JSON.stringify(attributes);
        let hash = 0;
        for (let i = 0; i < attrString.length; i++) {
            hash = ((hash << 5) - hash) + attrString.charCodeAt(i);
            hash |= 0;
        }

        // Create a jitter between -5% and +15% based on the hash
        const jitter = ((Math.abs(hash) % 200) / 1000) - 0.05;
        multiplier += jitter;

        return {
            min: Math.round(range.min * multiplier),
            max: Math.round(range.max * multiplier),
            currency: 'INR',
        };
    }

    /**
     * Get placeholder images based on jewellery category
     * Uses Unsplash API for high-quality jewellery photos
     */
    getPlaceholderImages(category) {
        // Unsplash Source API - random jewellery images
        const baseUrl = 'https://images.unsplash.com/photo';

        const imageMap = {
            'Ring': [
                `${baseUrl}-1605100804763-247f8c4d5b3e?w=400&h=400&fit=crop&q=80`, // Gold ring
                `${baseUrl}-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop&q=80`, // Diamond ring
            ],
            'Necklace': [
                `${baseUrl}-1599643478518-a784697e3f8c?w=400&h=400&fit=crop&q=80`, // Gold necklace
                `${baseUrl}-1611591437281-460bfbe1220a?w=400&h=400&fit=crop&q=80`, // Pearl necklace
            ],
            'Earring': [
                `${baseUrl}-1535632066927-3c3a4e0a0e7b?w=400&h=400&fit=crop&q=80`, // Gold earrings
                `${baseUrl}-1617038260897-41a1f14a8ca0?w=400&h=400&fit=crop&q=80`, // Diamond earrings
            ],
            'Bracelet': [
                `${baseUrl}-1611652022419-e4f6e2e3e3e3?w=400&h=400&fit=crop&q=80`, // Gold bracelet
                `${baseUrl}-1573408301185-9146fe634ad0?w=400&h=400&fit=crop&q=80`, // Diamond bracelet
            ],
            'Bangle': [
                `${baseUrl}-1611652022419-e4f6e2e3e3e3?w=400&h=400&fit=crop&q=80`, // Gold bracelet (reused)
                `${baseUrl}-1573408301185-9146fe634ad0?w=400&h=400&fit=crop&q=80`, // Diamond bracelet
            ],
            'Pendant': [
                `${baseUrl}-1611591437281-460bfbe1220a?w=400&h=400&fit=crop&q=80`, // Gold pendant
                `${baseUrl}-1599643478518-a784697e3f8c?w=400&h=400&fit=crop&q=80`, // Diamond pendant
            ],
        };

        // Get images for category or use default
        const images = imageMap[category] || imageMap['Ring'];

        // Return first image as main image
        return [images[0]];
    }

}

export default new RecommendationService();
