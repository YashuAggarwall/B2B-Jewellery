import mongoose from 'mongoose';

const manufacturerSKUSchema = new mongoose.Schema(
    {
        internalSKU: {
            type: String,
            required: true,
            unique: true,
        },
        // CRITICAL: Supplier details are INTERNAL ONLY - never exposed to external users
        supplierIdInternal: {
            type: String,
            required: true,
            select: false, // Never auto-populate in queries
        },
        supplierName: {
            type: String,
            required: true,
            select: false, // Never auto-populate in queries
        },
        alibabaProductId: {
            type: String,
            select: false, // Never auto-populate in queries
        },
        name: {
            type: String,
            required: true,
        },
        description: {
            type: String,
        },
        imageUrl: { // Added imageUrl field
            type: String,
        },
        category: {
            type: String,
            required: true,
            enum: ['Ring', 'Necklace', 'Earring', 'Bracelet', 'Pendant', 'Brooch', 'Other'],
        },
        baseCost: {
            type: Number,
            required: true,
        },
        moq: {
            type: Number,
            required: true,
            default: 1,
        },
        leadTimeDays: {
            type: Number,
            required: true,
        },
        customizationScope: {
            type: String,
            enum: ['None', 'Limited', 'Moderate', 'Extensive'],
            default: 'Limited',
        },
        customizationOptions: {
            metalChange: Boolean,
            stoneChange: Boolean,
            sizeAdjustment: Boolean,
            engraving: Boolean,
            finishChange: Boolean,
        },
        material: {
            metal: String,
            stones: [String],
        },
        specifications: {
            weight: Number,
            dimensions: Object,
            shape: String,
            finish: String,
        },
        images: [String],
        designPattern: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'DesignPattern',
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        isApproved: {
            type: Boolean,
            default: false,
        },
        lastVerifiedAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
manufacturerSKUSchema.index({ category: 1, isActive: 1 });
manufacturerSKUSchema.index({ designPattern: 1 });
manufacturerSKUSchema.index({ isApproved: 1 });

const ManufacturerSKU = mongoose.model('ManufacturerSKU', manufacturerSKUSchema);

export default ManufacturerSKU;
