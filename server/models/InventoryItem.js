import mongoose from 'mongoose';

const inventoryItemSchema = new mongoose.Schema(
    {
        sku: {
            type: String,
            required: true,
            unique: true,
        },
        name: {
            type: String,
            required: true,
        },
        description: {
            type: String,
        },
        category: {
            type: String,
            required: true,
            enum: ['Ring', 'Necklace', 'Earring', 'Bracelet', 'Pendant', 'Brooch', 'Other'],
        },
        material: {
            metal: {
                type: String,
                enum: ['Gold', 'Silver', 'Platinum', 'White Gold', 'Rose Gold', 'Brass', 'Stainless Steel'],
            },
            purity: String,
            stones: [
                {
                    type: String,
                    carat: Number,
                    quality: String,
                },
            ],
        },
        baseCost: {
            type: Number,
            required: true,
        },
        stockQuantity: {
            type: Number,
            required: true,
            default: 0,
        },
        images: [String],
        specifications: {
            weight: Number,
            dimensions: {
                length: Number,
                width: Number,
                height: Number,
            },
            shape: String,
            finish: String,
        },
        designPattern: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'DesignPattern',
        },
        isAvailable: {
            type: Boolean,
            default: true,
        },
        minOrderQuantity: {
            type: Number,
            default: 1,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes for efficient searching
inventoryItemSchema.index({ category: 1, isAvailable: 1 });
inventoryItemSchema.index({ designPattern: 1 });

const InventoryItem = mongoose.model('InventoryItem', inventoryItemSchema);

export default InventoryItem;
