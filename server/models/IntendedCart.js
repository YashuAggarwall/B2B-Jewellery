import mongoose from 'mongoose';

const intendedCartSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        cartNumber: {
            type: String,
            required: true,
            unique: true,
        },
        items: [
            {
                recommendationId: {
                    type: String,
                    required: true,
                },
                sourceType: {
                    type: String,
                    enum: ['Inventory', 'Manufacturer', 'Generic', 'External'],
                    required: true,
                },
                sourceId: {
                    type: String, // Changed from ObjectId to String to support External/Fallback IDs
                    required: false,
                },
                sourceModel: {
                    type: String,
                    enum: ['InventoryItem', 'ManufacturerSKU', 'Generic', 'External'],
                    required: false,
                },
                name: String,
                category: String,
                imageUrl: String,
                images: [String],
                quantity: {
                    type: Number,
                    required: true,
                    min: 1,
                },
                platformPriceRange: {
                    min: Number,
                    max: Number,
                },
                customizationRequests: {
                    type: String,
                },
                reviewStatus: {
                    type: String,
                    enum: ['Pending', 'Approved', 'Sourcing', 'Rejected'],
                    default: 'Pending',
                },
                salesNotes: {
                    type: String,
                },
                addedAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
        status: {
            type: String,
            enum: ['Draft', 'Submitted', 'Under Review', 'Approved', 'Quoted', 'Closed'],
            default: 'Draft',
        },
        isLocked: {
            type: Boolean,
            default: false,
        },
        submittedAt: {
            type: Date,
        },
        assignedTo: {
            sales: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
            sourcing: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
        },
        notes: [
            {
                userId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User',
                },
                role: String,
                content: String,
                createdAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
        closedAt: {
            type: Date,
        },
        closureReason: {
            type: String,
            enum: ['Converted', 'Rejected', 'Cancelled', 'Expired'],
        },
    },
    {
        timestamps: true,
    }
);

// Lock cart after submission
intendedCartSchema.pre('save', function (next) {
    if (this.status !== 'Draft' && !this.isLocked) {
        this.isLocked = true;
    }
    next();
});

// Indexes
intendedCartSchema.index({ userId: 1, status: 1 });
intendedCartSchema.index({ 'assignedTo.sales': 1 });
intendedCartSchema.index({ 'assignedTo.sourcing': 1 });

const IntendedCart = mongoose.model('IntendedCart', intendedCartSchema);

export default IntendedCart;
