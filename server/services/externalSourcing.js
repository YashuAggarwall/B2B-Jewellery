import axios from 'axios';
import pricingService from './pricing.js';

/**
 * External Sourcing Service
 * Real marketplace integration via RapidAPI Real-Time Product Search
 * Fetches actual jewelry products from Amazon, eBay, Walmart, etc.
 */
class ExternalSourcingService {
    constructor() {
        this.apiKey = process.env.RAPIDAPI_KEY;
        this.apiHost = process.env.RAPIDAPI_HOST || 'real-time-product-search.p.rapidapi.com';
        this.baseUrl = `https://${this.apiHost}`;

        // Fallback images for when API fails - using verified working URLs
        this.fallbackImages = {
            'Ring': [
                'https://images.unsplash.com/photo-1605100804763-247f8c4d5b3e?w=800&q=80',
                'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80',
                'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=800&q=80',
                'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&q=80',
            ],
            'Necklace': [
                'https://images.unsplash.com/photo-1599643478518-a784697e3f8c?w=800&q=80',
                'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&q=80',
                'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=800&q=80',
                'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80',
            ],
            'Earring': [
                'https://images.unsplash.com/photo-1535632066927-3c3a4e0a0e7b?w=800&q=80',
                'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=800&q=80',
                'https://images.unsplash.com/photo-1629552077796-5cb5f8b1f7f5?w=800&q=80',
                'https://images.unsplash.com/photo-1596944924616-7b38e7cfac36?w=800&q=80',
            ],
            'Bracelet': [
                'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=800&q=80',
                'https://images.unsplash.com/photo-1611652022419-a7bcc1f86fa2?w=800&q=80',
                'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80',
                'https://images.unsplash.com/photo-1599643478518-a784697e3f8c?w=800&q=80',
            ],
            'Pendant': [
                'https://images.unsplash.com/photo-1599643478518-a784697e3f8c?w=800&q=80',
                'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&q=80',
                'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=800&q=80',
                'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80',
            ],
            'Bangle': [
                'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=800&q=80',
                'https://images.unsplash.com/photo-1611652022419-a7bcc1f86fa2?w=800&q=80',
                'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80',
                'https://images.unsplash.com/photo-1599643478518-a784697e3f8c?w=800&q=80',
            ]
        };

        this.adjectives = ['Premium', 'Artisan', 'Contemporary', 'Elegant', 'Minimalist', 'Luxe', 'Bespoke'];
        this.metals = ['Yellow Gold', 'Rose Gold', 'White Gold', 'Platinum', 'Sterling Silver'];
    }

    /**
     * Search real marketplace for jewelry products via RapidAPI
     */
    async search(attributes, count = 3) {
        // Check if API key is configured (check at runtime, not constructor)
        const apiKey = process.env.RAPIDAPI_KEY;
        const apiHost = process.env.RAPIDAPI_HOST || 'real-time-product-search.p.rapidapi.com';

        if (!apiKey || apiKey === 'your_rapidapi_key_here' || apiKey.length < 20) {
            console.warn('⚠️  RapidAPI key not configured. Using fallback data.');
            console.warn('💡 Get your free API key from: https://rapidapi.com/letscrape-6bRBa3QguO5/api/real-time-product-search');
            return await this.getFallbackResults(attributes, count);
        }

        try {
            console.log(`🌐 Calling RapidAPI for: ${attributes.category}...`);

            // Build search query
            const searchQuery = this.buildSearchQuery(attributes);
            console.log(`🔍 Search query: "${searchQuery}"`);

            // Call RapidAPI - using /product-search endpoint
            const response = await axios.get(`https://${apiHost}/product-search`, {
                params: {
                    q: searchQuery,
                    country: 'in', // India
                    language: 'en',
                    limit: count * 2 // Request more to filter better results
                },
                headers: {
                    'X-RapidAPI-Key': apiKey,
                    'X-RapidAPI-Host': apiHost
                },
                timeout: 10000 // 10 second timeout
            });

            console.log(`✅ RapidAPI responded with ${response.data?.data?.length || 0} results`);

            // Transform API response to our format
            return this.transformResults(response.data.data, attributes, count);

        } catch (error) {
            if (error.response) {
                console.error(`❌ RapidAPI Error (${error.response.status}):`, error.response.data?.message || error.message);
                if (error.response.status === 429) {
                    console.error('⚠️  Rate limit exceeded. Free tier: 100 requests/month');
                } else if (error.response.status === 403) {
                    console.error('⚠️  Invalid API key or subscription expired');
                }
            } else if (error.request) {
                console.error('❌ RapidAPI Network Error:', error.message);
            } else {
                console.error('❌ RapidAPI Error:', error.message);
            }

            // Fallback to simulated data if API fails
            console.log('🔄 Falling back to simulated data...');
            return this.getFallbackResults(attributes, count);
        }
    }

    /**
     * Build search query from attributes
     */
    buildSearchQuery(attributes) {
        const category = attributes.category || 'jewelry';
        const shape = attributes.shape || '';
        const metal = 'gold'; // Default to gold for jewelry

        // Build query: "gold ring" or "oval gold necklace"
        return `${shape} ${metal} ${category}`.trim().toLowerCase();
    }

    /**
     * Transform RapidAPI results to our recommendation format
     */
    transformResults(products, attributes, count) {
        if (!products || !Array.isArray(products)) {
            console.warn('⚠️  No valid products from API');
            return [];
        }

        // Filter out products without images FIRST
        const productsWithImages = products.filter(product =>
            product.product_photos &&
            product.product_photos.length > 0 &&
            product.product_photos[0] // Ensure first image exists
        );

        console.log(`✅ Filtered to ${productsWithImages.length} products with images (from ${products.length} total)`);

        // Transform products to our format
        const results = productsWithImages
            .slice(0, count) // Take only what we need
            .map(product => {
                // Extract price from offer
                const price = product.offer?.price || product.typical_price_range?.[0];

                return {
                    recommendationId: `ext-${product.product_id || Date.now()}`,
                    sourceType: 'External',
                    sourceId: product.product_id,
                    name: this.cleanProductName(product.product_title),
                    description: product.product_description || `High-quality ${attributes.category} from verified marketplace seller.`,
                    category: attributes.category,
                    images: product.product_photos || [],
                    priceRange: this.convertPrice(price, attributes),
                    availability: 'Marketplace Match',
                    leadTime: product.delivery || '3-5 days',
                    moq: 1,
                    customizationAvailable: true,
                    isMarketplace: true,
                    externalSource: product.product_page_url || null
                };
            });

        // If we got fewer results than requested, fill with fallback
        if (results.length < count) {
            console.log(`⚠️  Only got ${results.length}/${count} results with images, filling with fallback`);
            const fallbackCount = count - results.length;
            const fallback = this.getFallbackResults(attributes, fallbackCount);
            results.push(...fallback);
        }

        return results;
    }

    /**
     * Clean product name (remove extra info, limit length)
     */
    cleanProductName(title) {
        if (!title) return 'Jewelry Item';

        // Remove common marketplace junk
        let cleaned = title
            .replace(/\([^)]*\)/g, '') // Remove parentheses content
            .replace(/\[[^\]]*\]/g, '') // Remove bracket content
            .replace(/\s+/g, ' ') // Normalize spaces
            .trim();

        // Limit length
        if (cleaned.length > 80) {
            cleaned = cleaned.substring(0, 77) + '...';
        }

        return cleaned || 'Jewelry Item';
    }

    /**
     * Convert API price to our price range format
     */
    async convertPrice(apiPrice, attributes) {
        let baseCost = this.getBaseCost(attributes.category);

        if (apiPrice) {
            // Parse price (could be "$123.45" or "123.45")
            const priceNum = parseFloat(apiPrice.toString().replace(/[^0-9.]/g, ''));

            if (!isNaN(priceNum) && priceNum > 0) {
                // Convert USD to INR (approximate: 1 USD = 83 INR)
                baseCost = priceNum * 83;
            }
        }

        // Calculate platform price range with margins
        return await pricingService.calculatePriceRange(
            baseCost,
            attributes.category,
            'Gold'
        );
    }

    /**
     * Get placeholder image for category
     */
    getPlaceholderImage(category) {
        const images = this.fallbackImages[category] || this.fallbackImages['Ring'];
        return images[0];
    }

    /**
     * Get base cost for category (fallback pricing)
     */
    getBaseCost(category) {
        const ranges = {
            'Ring': 4000,
            'Necklace': 25000,
            'Earring': 8000,
            'Bracelet': 15000,
            'Pendant': 7000,
        };
        const base = ranges[category] || 5000;
        return base + (Math.random() * base * 0.5); // Add variety
    }

    /**
     * Fallback to simulated data when API is unavailable
     */
    async getFallbackResults(attributes, count) {
        console.log(`🔄 Generating ${count} fallback results for ${attributes.category}`);

        const results = [];
        const images = this.fallbackImages[attributes.category] || this.fallbackImages['Ring'];

        for (let i = 0; i < count; i++) {
            const adj = this.adjectives[Math.floor(Math.random() * this.adjectives.length)];
            const metal = this.metals[Math.floor(Math.random() * this.metals.length)];
            const shape = attributes.shape || 'Round';

            const name = `${adj} ${shape} ${attributes.category} in ${metal}`;
            const baseCost = this.getBaseCost(attributes.category);

            // Generate varied lead times
            const leadTimes = ['3-5 days', '5-7 days', '7-10 days', '10-14 days', '12-18 days', '14-21 days'];
            const leadTime = leadTimes[i % leadTimes.length];

            results.push({
                recommendationId: `ext-${Date.now()}-${Math.round(Math.random() * 10000)}`,
                sourceType: 'External',
                sourceId: `FALLBACK-${Math.random().toString(36).substring(7).toUpperCase()}`,
                name: name,
                description: `Sourced from global manufacturing network. High-quality ${metal} construction with ${shape} profile.`,
                category: attributes.category,
                images: [images[i % images.length]],
                priceRange: await pricingService.calculatePriceRange(baseCost, attributes.category, metal),
                availability: 'Marketplace Match',
                leadTime: leadTime,
                moq: 1,
                customizationAvailable: true,
                isMarketplace: true
            });
        }

        return results;
    }
}

export default new ExternalSourcingService();
