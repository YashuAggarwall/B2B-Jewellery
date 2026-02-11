import mongoose from 'mongoose';

const marginConfigSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        description: {
            type: String,
        },
        applicationType: {
            type: String,
            enum: ['Category', 'Material', 'PriceRange', 'Global'],
            required: true,
        },
        category: {
            type: String,
            enum: ['Ring', 'Necklace', 'Earring', 'Bracelet', 'Pendant', 'Brooch', 'Other', 'All'],
        },
        material: {
            type: String,
        },
        priceRange: {
            min: Number,
            max: Number,
        },
        marginType: {
            type: String,
            enum: ['Percentage', 'Fixed'],
            required: true,
        },
        marginValue: {
            type: Number,
            required: true,
        },
        priority: {
            type: Number,
            default: 0,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        lastModifiedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
marginConfigSchema.index({ applicationType: 1, isActive: 1 });
marginConfigSchema.index({ priority: -1 });

const MarginConfig = mongoose.model('MarginConfig', marginConfigSchema);

export default MarginConfig;
