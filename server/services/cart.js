import IntendedCart from '../models/IntendedCart.js';
import recommendationService from './recommendation.js';

/**
 * Cart Service
 * Manages intended cart lifecycle
 * CRITICAL: Cart locks after submission - no modifications allowed
 */

class CartService {
    /**
     * Get or create cart for user
     */
    async getOrCreateCart(userId) {
        // Note: We don't populate items.sourceId because Generic items have no backing model
        // If needed, populate conditionally in specific routes
        let cart = await IntendedCart.findOne({
            userId,
            status: 'Draft',
        });

        if (!cart) {
            const cartNumber = await this.generateCartNumber();
            cart = await IntendedCart.create({
                userId,
                cartNumber,
                items: [],
                status: 'Draft',
            });
        }

        return cart;
    }

    /**
     * Add item to cart
     */
    async addItem(userId, recommendationId, quantity, customizationRequests = null, productDetails = null) {
        const cart = await this.getOrCreateCart(userId);

        // Verify cart is not locked
        if (cart.isLocked) {
            throw new Error('Cart is locked and cannot be modified');
        }

        // Get recommendation details
        console.log('📦 Cart service: About to call getRecommendationDetails for:', recommendationId);
        const recommendation = await recommendationService.getRecommendationDetails(recommendationId, productDetails);
        console.log('📦 Cart service: getRecommendationDetails returned:', recommendation);

        if (!recommendation) {
            throw new Error('Recommendation not found');
        }

        // Check if item already in cart
        const existingItemIndex = cart.items.findIndex(
            item => item.recommendationId === recommendationId
        );

        if (existingItemIndex >= 0) {
            // Update quantity
            cart.items[existingItemIndex].quantity += quantity;
        } else {
            // Add new item
            // Determine sourceModel based on sourceType
            let sourceModel = null;
            if (recommendation.sourceType === 'Inventory') {
                sourceModel = 'InventoryItem';
            } else if (recommendation.sourceType === 'Manufacturer') {
                sourceModel = 'ManufacturerSKU';
            } else if (recommendation.sourceType === 'Generic') {
                sourceModel = 'Generic';
            } else if (recommendation.sourceType === 'External') {
                sourceModel = 'External';
            }

            cart.items.push({
                recommendationId,
                sourceType: recommendation.sourceType,
                sourceId: recommendation.sourceId || null,
                sourceModel,
                name: recommendation.name,
                category: recommendation.category,
                imageUrl: recommendation.imageUrl || (recommendation.images && recommendation.images.length > 0 ? recommendation.images[0] : null),
                images: recommendation.images || [], // Store as array to match frontend
                quantity: quantity,
                platformPriceRange: recommendation.priceRange,
                customizationRequests,
            });
        }

        await cart.save();
        return cart;
    }

    /**
     * Remove item from cart
     */
    async removeItem(userId, itemId) {
        const cart = await this.getOrCreateCart(userId);

        if (cart.isLocked) {
            throw new Error('Cart is locked and cannot be modified');
        }

        cart.items = cart.items.filter(item => item._id.toString() !== itemId);
        await cart.save();

        return cart;
    }

    /**
     * Update item quantity
     */
    async updateItemQuantity(userId, itemId, quantity) {
        const cart = await this.getOrCreateCart(userId);

        if (cart.isLocked) {
            throw new Error('Cart is locked and cannot be modified');
        }

        const item = cart.items.find(item => item._id.toString() === itemId);

        if (!item) {
            throw new Error('Item not found in cart');
        }

        item.quantity = quantity;
        await cart.save();

        return cart;
    }

    /**
     * Submit cart for review
     * CRITICAL: Locks cart - no further modifications allowed
     */
    async submitCart(userId) {
        const cart = await this.getOrCreateCart(userId);

        if (cart.items.length === 0) {
            throw new Error('Cannot submit empty cart');
        }

        if (cart.isLocked) {
            throw new Error('Cart already submitted');
        }

        cart.status = 'Submitted';
        cart.isLocked = true;
        cart.submittedAt = new Date();
        await cart.save();

        return cart;
    }

    /**
     * Get all carts (for Sales/Sourcing/Admin)
     */
    async getAllCarts(filters = {}) {
        const query = {};

        if (filters.status) query.status = filters.status;
        if (filters.userId) query.userId = filters.userId;
        if (filters.assignedToSales) query['assignedTo.sales'] = filters.assignedToSales;
        if (filters.assignedToSourcing) query['assignedTo.sourcing'] = filters.assignedToSourcing;

        return await IntendedCart.find(query)
            .populate('userId', 'name email company')
            .populate('assignedTo.sales', 'name email')
            .populate('assignedTo.sourcing', 'name email')
            .sort({ submittedAt: -1 });
    }

    /**
     * Get user's cart history (all submitted carts, excluding cancelled ones)
     */
    async getUserCartHistory(userId) {
        return await IntendedCart.find({
            userId,
            status: { $nin: ['Draft', 'Closed'] }, // Exclude draft and closed carts
        })
            .sort({ submittedAt: -1 })
            .select('cartNumber status submittedAt items closedAt closureReason createdAt');
    }

    /**
     * Assign cart to sales/sourcing user
     */
    async assignCart(cartId, role, userId) {
        const cart = await IntendedCart.findById(cartId);

        if (!cart) {
            throw new Error('Cart not found');
        }

        if (role === 'sales') {
            cart.assignedTo.sales = userId;
        } else if (role === 'sourcing') {
            cart.assignedTo.sourcing = userId;
        }

        await cart.save();
        return cart;
    }

    /**
     * Add note to cart
     */
    async addNote(cartId, userId, role, content) {
        const cart = await IntendedCart.findById(cartId);

        if (!cart) {
            throw new Error('Cart not found');
        }

        cart.notes.push({
            userId,
            role,
            content,
        });

        await cart.save();
        return cart;
    }

    /**
     * Update cart status
     */
    async updateStatus(cartId, status, closureReason = null) {
        const cart = await IntendedCart.findById(cartId);

        if (!cart) {
            throw new Error('Cart not found');
        }

        cart.status = status;

        if (status === 'Closed') {
            cart.closedAt = new Date();
            cart.closureReason = closureReason;
        }

        await cart.save();
        return cart;
    }

    /**
     * Cancel cart (for External users)
     * Only allows canceling carts in "Submitted" status
     */
    async cancelCart(cartId, userId) {
        const cart = await IntendedCart.findById(cartId);

        if (!cart) {
            throw new Error('Cart not found');
        }

        // Verify the cart belongs to the user
        if (cart.userId.toString() !== userId.toString()) {
            throw new Error('Unauthorized: This cart does not belong to you');
        }

        // Only allow canceling submitted carts
        if (cart.status !== 'Submitted') {
            throw new Error(`Cannot cancel cart with status: ${cart.status}. Only "Submitted" carts can be cancelled.`);
        }

        // Update to closed status
        cart.status = 'Closed';
        cart.closedAt = new Date();
        cart.closureReason = 'Cancelled';

        await cart.save();
        return cart;
    }

    /**
     * Update status and notes for a specific item in a cart
     * (Sales/Admin only)
     */
    async updateItemStatus(cartId, itemId, status, notes = null) {
        const cart = await IntendedCart.findById(cartId);

        if (!cart) {
            throw new Error('Cart not found');
        }

        const item = cart.items.find(item => item._id.toString() === itemId);
        if (!item) {
            throw new Error('Item not found in cart');
        }

        item.reviewStatus = status;
        if (notes !== null) {
            item.salesNotes = notes;
        }

        // AUTO-SYNC CART STATUS:
        // 1. If at least one item is being reviewed, move from 'Submitted' to 'Under Review'
        // 2. If an item is moved back to 'Pending' or 'Sourcing' from an 'Approved' or 'Quoted' cart,
        //    revert the cart status to 'Under Review' so it can be re-finalized.
        const nonFinalStatus = ['Pending', 'Sourcing'];
        const isReverting = nonFinalStatus.includes(status);
        const finalizedCartStatus = ['Approved', 'Quoted'];

        if (cart.status === 'Submitted' || (isReverting && finalizedCartStatus.includes(cart.status))) {
            cart.status = 'Under Review';
        }

        await cart.save();
        return cart;
    }

    /**
     * Approve all items in a cart
     * (Sales/Admin only)
     */
    async approveWholeCart(cartId) {
        const cart = await IntendedCart.findById(cartId);

        if (!cart) {
            throw new Error('Cart not found');
        }

        cart.items.forEach(item => {
            item.reviewStatus = 'Approved';
        });

        cart.status = 'Under Review';
        await cart.save();
        return cart;
    }

    /**
     * Finalize cart review and mark as Approved
     * (Sales/Admin only)
     */
    async approveCart(cartId) {
        const cart = await IntendedCart.findById(cartId);

        if (!cart) {
            throw new Error('Cart not found');
        }

        // Check if all items are reviewed (Approved or Rejected)
        const allReviewed = cart.items.every(item =>
            item.reviewStatus === 'Approved' || item.reviewStatus === 'Rejected'
        );

        if (!allReviewed) {
            throw new Error('All items must be reviewed (Approved or Rejected) before finalizing the cart.');
        }

        cart.status = 'Approved';
        await cart.save();
        return cart;
    }

    /**
     * Generate unique cart number
     */
    async generateCartNumber() {
        const prefix = 'CART';
        const timestamp = Date.now().toString(36).toUpperCase();
        const random = Math.random().toString(36).substring(2, 6).toUpperCase();
        return `${prefix}-${timestamp}-${random}`;
    }
}

export default new CartService();
