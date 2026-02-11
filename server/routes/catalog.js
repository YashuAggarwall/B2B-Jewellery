import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import InventoryItem from '../models/InventoryItem.js';
import ManufacturerSKU from '../models/ManufacturerSKU.js';
import { auditLogger } from '../middleware/auditLogger.js';

const router = express.Router();

/**
 * HELPER: Map ManufacturerSKU to InventoryItem format
 */
const mapToInventoryItem = (manufacturerSKU) => {
    return {
        sku: manufacturerSKU.internalSKU,
        name: manufacturerSKU.name,
        description: manufacturerSKU.description,
        category: manufacturerSKU.category,
        material: {
            metal: ['Gold', 'Silver', 'Platinum', 'White Gold', 'Rose Gold', 'Brass', 'Stainless Steel'].includes(manufacturerSKU.material?.metal)
                ? manufacturerSKU.material.metal
                : 'Gold', // Default or sanitized
            stones: (manufacturerSKU.material?.stones || []).map(s => ({ type: s })),
        },
        baseCost: manufacturerSKU.baseCost,
        stockQuantity: 0, // Manufacturer SKUs start with 0 stock until ordered
        images: manufacturerSKU.imageUrl ? [manufacturerSKU.imageUrl] : (manufacturerSKU.images || []),
        specifications: {
            weight: manufacturerSKU.specifications?.weight,
            shape: manufacturerSKU.specifications?.shape,
            finish: manufacturerSKU.specifications?.finish,
        },
        designPattern: manufacturerSKU.designPattern,
        isAvailable: manufacturerSKU.isActive,
        minOrderQuantity: manufacturerSKU.moq,
    };
};

/**
 * INVENTORY ROUTES
 */

/**
 * @route   GET /api/catalog/inventory
 * @desc    Search internal inventory
 * @access  Private (Sales, Sourcing, Admin)
 */
router.get('/inventory', protect, authorize('Sales', 'Sourcing', 'Admin'), async (req, res) => {
    try {
        const query = { isAvailable: true };

        if (req.query.category) query.category = req.query.category;
        if (req.query.material) query['material.metal'] = req.query.material;
        if (req.query.shape) query['specifications.shape'] = req.query.shape;

        const items = await InventoryItem.find(query).populate('designPattern');

        res.status(200).json({
            success: true,
            data: items,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

/**
 * @route   GET /api/catalog/inventory/:id
 * @desc    Get inventory item by ID
 * @access  Private (Sales, Sourcing, Admin)
 */
router.get('/inventory/:id', protect, authorize('Sales', 'Sourcing', 'Admin'), async (req, res) => {
    try {
        const item = await InventoryItem.findById(req.params.id).populate('designPattern');

        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Inventory item not found',
            });
        }

        res.status(200).json({
            success: true,
            data: item,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

/**
 * @route   POST /api/catalog/inventory
 * @desc    Add inventory item
 * @access  Private (Admin)
 */
router.post('/inventory', protect, authorize('Admin'), auditLogger('Add Inventory Item', 'InventoryItem'), async (req, res) => {
    try {
        const item = await InventoryItem.create(req.body);

        res.status(201).json({
            success: true,
            data: item,
            message: 'Inventory item added successfully',
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
});

/**
 * @route   PUT /api/catalog/inventory/:id
 * @desc    Update inventory item
 * @access  Private (Admin)
 */
router.put('/inventory/:id', protect, authorize('Admin'), auditLogger('Update Inventory Item', 'InventoryItem'), async (req, res) => {
    try {
        const item = await InventoryItem.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Inventory item not found',
            });
        }

        res.status(200).json({
            success: true,
            data: item,
            message: 'Inventory item updated successfully',
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
});

/**
 * @route   DELETE /api/catalog/inventory/:id
 * @desc    Delete inventory item
 * @access  Private (Admin)
 */
router.delete('/inventory/:id', protect, authorize('Admin'), auditLogger('Delete Inventory Item', 'InventoryItem'), async (req, res) => {
    try {
        const item = await InventoryItem.findByIdAndDelete(req.params.id);

        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Inventory item not found',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Inventory item deleted successfully',
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
});

/**
 * MANUFACTURER SKU ROUTES
 * CRITICAL: These routes are INTERNAL ONLY - never expose to external users
 */

/**
 * @route   GET /api/catalog/manufacturers
 * @desc    List manufacturer SKUs (Sourcing/Admin only)
 * @access  Private (Sourcing, Admin)
 */
router.get('/manufacturers', protect, authorize('Sourcing', 'Admin'), async (req, res) => {
    try {
        const query = {};

        if (req.query.isActive !== undefined) query.isActive = req.query.isActive === 'true';

        if (req.query.category) query.category = req.query.category;
        if (req.query.isApproved !== undefined) query.isApproved = req.query.isApproved === 'true';

        // For Sourcing/Admin: include supplier details
        const items = await ManufacturerSKU.find(query)
            .select('+supplierIdInternal +supplierName +alibabaProductId')
            .populate('designPattern');

        res.status(200).json({
            success: true,
            data: items,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

/**
 * @route   GET /api/catalog/manufacturers/stats
 * @desc    Get manufacturer SKU statistics
 * @access  Private (Sourcing, Admin)
 */
router.get('/manufacturers/stats', protect, authorize('Sourcing', 'Admin'), async (req, res) => {
    try {
        const stats = await ManufacturerSKU.aggregate([
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    pending: { $sum: { $cond: [{ $eq: ['$isApproved', false] }, 1, 0] } },
                    approved: { $sum: { $cond: [{ $eq: ['$isApproved', true] }, 1, 0] } },
                    active: { $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] } },
                    inactive: { $sum: { $cond: [{ $eq: ['$isActive', false] }, 1, 0] } },
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: stats[0] || {
                total: 0,
                pending: 0,
                approved: 0,
                active: 0,
                inactive: 0
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

/**
 * @route   GET /api/catalog/manufacturers/:id
 * @desc    Get manufacturer SKU by ID
 * @access  Private (Sourcing, Admin)
 */
router.get('/manufacturers/:id', protect, authorize('Sourcing', 'Admin'), async (req, res) => {
    try {
        const item = await ManufacturerSKU.findById(req.params.id)
            .select('+supplierIdInternal +supplierName +alibabaProductId')
            .populate('designPattern');

        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Manufacturer SKU not found',
            });
        }

        res.status(200).json({
            success: true,
            data: item,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

/**
 * @route   POST /api/catalog/manufacturers
 * @desc    Add manufacturer SKU
 * @access  Private (Sourcing, Admin)
 */
router.post('/manufacturers', protect, authorize('Sourcing', 'Admin'), auditLogger('Add Manufacturer SKU', 'ManufacturerSKU'), async (req, res) => {
    try {
        const item = await ManufacturerSKU.create(req.body);

        // SYNC: Create corresponding Inventory Item
        try {
            await InventoryItem.create(mapToInventoryItem(item));
        } catch (syncError) {
            console.error('Inventory Sync Error (Create):', syncError);
            // We don't fail the primary request, but log the sync failure
        }

        res.status(201).json({
            success: true,
            data: item,
            message: 'Manufacturer SKU added successfully',
        });
    } catch (error) {
        // Handle duplicate SKU error
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'A manufacturer SKU with this ID already exists. Please refresh or try another ID.',
            });
        }
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
});

/**
 * @route   PUT /api/catalog/manufacturers/:id
 * @desc    Update manufacturer SKU
 * @access  Private (Sourcing, Admin)
 */
router.put('/manufacturers/:id', protect, authorize('Sourcing', 'Admin'), auditLogger('Update Manufacturer SKU', 'ManufacturerSKU'), async (req, res) => {
    try {
        const item = await ManufacturerSKU.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Manufacturer SKU not found',
            });
        }

        // SYNC: Update corresponding Inventory Item (identify by SKU)
        try {
            await InventoryItem.findOneAndUpdate(
                { sku: item.internalSKU },
                mapToInventoryItem(item),
                { upsert: true } // Create if doesn't exist for some reason
            );
        } catch (syncError) {
            console.error('Inventory Sync Error (Update):', syncError);
        }

        res.status(200).json({
            success: true,
            data: item,
            message: 'Manufacturer SKU updated successfully',
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
});

/**
 * @route   PATCH /api/catalog/manufacturers/:id
 * @desc    Partial update manufacturer SKU (approve, status, etc)
 * @access  Private (Sourcing, Admin)
 */
router.patch('/manufacturers/:id', protect, authorize('Sourcing', 'Admin'), async (req, res) => {
    try {
        const updateData = { ...req.body };

        // If approving, update lastVerifiedAt
        if (updateData.isApproved === true) {
            updateData.lastVerifiedAt = new Date();
        }

        const item = await ManufacturerSKU.findByIdAndUpdate(req.params.id, updateData, {
            new: true,
            runValidators: true,
        });

        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Manufacturer SKU not found',
            });
        }

        // SYNC: Partial update Inventory Item
        try {
            const inventoryUpdate = {};
            if (updateData.name) inventoryUpdate.name = updateData.name;
            if (updateData.isActive !== undefined) inventoryUpdate.isAvailable = updateData.isActive;
            if (updateData.baseCost) inventoryUpdate.baseCost = updateData.baseCost;

            if (Object.keys(inventoryUpdate).length > 0) {
                await InventoryItem.findOneAndUpdate(
                    { sku: item.internalSKU },
                    { $set: inventoryUpdate }
                );
            }
        } catch (syncError) {
            console.error('Inventory Sync Error (Patch):', syncError);
        }

        res.status(200).json({
            success: true,
            data: item,
            message: 'Manufacturer SKU updated successfully',
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
});

/**
 * @route   DELETE /api/catalog/manufacturers/:id
 * @desc    Delete manufacturer SKU
 * @access  Private (Sourcing, Admin)
 */
router.delete('/manufacturers/:id', protect, authorize('Sourcing', 'Admin'), auditLogger('Delete Manufacturer SKU', 'ManufacturerSKU'), async (req, res) => {
    try {
        const item = await ManufacturerSKU.findByIdAndDelete(req.params.id);

        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Manufacturer SKU not found',
            });
        }

        // SYNC: Delete from Inventory
        try {
            await InventoryItem.findOneAndDelete({ sku: item.internalSKU });
        } catch (syncError) {
            console.error('Inventory Sync Error (Delete):', syncError);
        }

        res.status(200).json({
            success: true,
            message: 'Manufacturer SKU deleted successfully',
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
});

export default router;
