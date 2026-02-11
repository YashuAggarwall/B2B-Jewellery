import Quotation from '../models/Quotation.js';
import IntendedCart from '../models/IntendedCart.js';
import InventoryItem from '../models/InventoryItem.js';
import ManufacturerSKU from '../models/ManufacturerSKU.js';
import pricingService from './pricing.js';

/**
 * Quotation Service
 * Generates and manages quotations with admin-configured margins
 */

class QuotationService {
    /**
     * Generate quotation from cart
     */
    async generateQuotation(cartId, createdBy, options = {}) {
        const cart = await IntendedCart.findById(cartId);

        if (!cart) {
            throw new Error('Cart not found');
        }

        if (cart.status !== 'Submitted' && cart.status !== 'Under Review' && cart.status !== 'Approved') {
            throw new Error('Cart must be submitted before generating quotation');
        }

        // Filter for approved items only
        const approvedItems = cart.items.filter(item => item.reviewStatus === 'Approved');

        if (approvedItems.length === 0) {
            throw new Error('No items have been approved for quotation yet. Please approve at least one item first.');
        }

        // Build line items with pricing from approved items
        const lineItems = await this.buildLineItems(approvedItems);

        // Calculate totals
        const totals = await pricingService.calculateQuotationTotal(lineItems);

        // Generate quotation number
        const quotationNumber = await this.generateQuotationNumber();

        // Calculate validity date
        const validDays = options.validDays || 30;
        const validUntil = new Date(Date.now() + validDays * 24 * 60 * 60 * 1000);

        // Create quotation
        const quotation = await Quotation.create({
            quotationNumber,
            cartId: cart._id,
            userId: cart.userId,
            lineItems,
            subtotal: totals.subtotal,
            totalMargin: totals.totalMargin,
            grandTotal: totals.grandTotal,
            createdBy,
            status: 'Draft',
            notes: options.notes || '',
            validUntil,
        });

        // Update cart status
        cart.status = 'Quoted';
        await cart.save();

        return quotation;
    }

    /**
     * Build line items with pricing details
     */
    async buildLineItems(cartItems) {
        const lineItems = [];

        for (const item of cartItems) {
            let baseCost, moq, leadTimeDays, category, material;

            // Get source details
            if (item.sourceType === 'Inventory') {
                const inventoryItem = await InventoryItem.findById(item.sourceId);
                baseCost = inventoryItem.baseCost;
                moq = inventoryItem.minOrderQuantity || 1;
                leadTimeDays = 5; // Default for inventory
                category = inventoryItem.category;
                material = inventoryItem.material.metal;
            } else if (item.sourceType === 'Manufacturer') {
                const manufacturerSKU = await ManufacturerSKU.findById(item.sourceId)
                    .select('-supplierIdInternal -supplierName -alibabaProductId');
                baseCost = manufacturerSKU.baseCost;
                moq = manufacturerSKU.moq;
                leadTimeDays = manufacturerSKU.leadTimeDays;
                category = manufacturerSKU.category;
                material = manufacturerSKU.material.metal;
            } else if (item.sourceType === 'Generic') {
                // For generic/custom items, use the platform price range or a default
                baseCost = item.platformPriceRange?.min || 5000;
                moq = 1;
                leadTimeDays = 15; // Standard for custom
                category = item.category || 'Custom';
                material = 'Gold'; // Default for custom unless specified
            } else if (item.sourceType === 'External') {
                // For external items, use the platform price range min as a base for cost
                // In a real scenario, this would be updated by the sourcing team before approval
                baseCost = item.platformPriceRange?.min || 5000;
                moq = 1;
                leadTimeDays = 15;
                category = item.category || 'External Sourcing';
                material = 'Gold';
            }

            // Calculate pricing
            const pricing = await pricingService.calculateQuotationLineItem(
                baseCost,
                item.quantity,
                category,
                material
            );

            lineItems.push({
                cartItemId: item._id,
                name: item.name,
                category: item.category,
                quantity: item.quantity,
                baseCost: pricing.baseCost,
                marginApplied: pricing.marginApplied,
                unitPrice: pricing.unitPrice,
                totalPrice: pricing.totalPrice,
                moq,
                leadTimeDays,
                customizationNotes: item.customizationRequests,
            });
        }

        return lineItems;
    }

    /**
     * Send quotation to customer
     */
    async sendQuotation(quotationId) {
        const quotation = await Quotation.findById(quotationId);

        if (!quotation) {
            throw new Error('Quotation not found');
        }

        quotation.status = 'Sent';
        quotation.sentAt = new Date();
        await quotation.save();

        // In production: Send email to customer
        // await emailService.sendQuotation(quotation);

        return quotation;
    }

    /**
     * Create quotation revision
     */
    async createRevision(quotationId, changes, revisedBy) {
        const quotation = await Quotation.findById(quotationId);

        if (!quotation) {
            throw new Error('Quotation not found');
        }

        // Store revision history
        quotation.revisionHistory.push({
            version: quotation.version,
            changes,
            revisedBy,
            revisedAt: new Date(),
        });

        // Increment version
        quotation.version += 1;
        quotation.status = 'Revised';

        await quotation.save();
        return quotation;
    }

    /**
     * Approve quotation
     */
    async approveQuotation(quotationId, approvedBy) {
        const quotation = await Quotation.findById(quotationId);

        if (!quotation) {
            throw new Error('Quotation not found');
        }

        quotation.status = 'Approved';
        quotation.approvedAt = new Date();
        quotation.approvedBy = approvedBy;

        await quotation.save();

        // Update cart status
        await IntendedCart.findByIdAndUpdate(quotation.cartId, {
            status: 'Closed',
            closureReason: 'Converted',
            closedAt: new Date(),
        });

        return quotation;
    }

    /**
     * Reject quotation
     */
    async rejectQuotation(quotationId, reason) {
        const quotation = await Quotation.findById(quotationId);

        if (!quotation) {
            throw new Error('Quotation not found');
        }

        quotation.status = 'Rejected';
        quotation.rejectedAt = new Date();
        quotation.rejectionReason = reason;

        await quotation.save();
        return quotation;
    }

    /**
     * Get all quotations with filters
     */
    async getAll(filters = {}) {
        const query = {};
        if (filters.status) query.status = filters.status;
        if (filters.userId) query.userId = filters.userId;
        if (filters.createdBy) query.createdBy = filters.createdBy;

        return await Quotation.find(query)
            .populate('userId', 'name email company')
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 });
    }

    /**
     * Get quotation by cart ID
     */
    async getQuotationByCartId(cartId) {
        return await Quotation.findOne({ cartId }).sort({ createdAt: -1 });
    }

    /**
     * Generate unique quotation number
     */
    async generateQuotationNumber() {
        const prefix = 'QT';
        const year = new Date().getFullYear();
        const count = await Quotation.countDocuments();
        const sequence = (count + 1).toString().padStart(5, '0');
        return `${prefix}-${year}-${sequence}`;
    }
}

export default new QuotationService();
