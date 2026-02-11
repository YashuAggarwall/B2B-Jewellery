import mongoose from 'mongoose';

const imageSessionSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        imageId: {
            type: String,
            required: true,
            unique: true,
        },
        originalFilename: {
            type: String,
            required: true,
        },
        extractedAttributes: {
            category: {
                type: String,
                enum: ['Ring', 'Necklace', 'Earring', 'Bracelet', 'Pendant', 'Brooch', 'Other'],
            },
            shape: {
                type: String,
                enum: ['Round', 'Oval', 'Square', 'Rectangular', 'Heart', 'Pear', 'Marquise', 'Cushion', 'Other'],
            },
            metalVisibility: {
                type: String,
                enum: ['High', 'Medium', 'Low', 'None'],
            },
            stonePresence: {
                type: Boolean,
                default: false,
            },
            stoneDensity: {
                type: String,
                enum: ['None', 'Sparse', 'Medium', 'Dense'],
                default: 'None',
            },
            finish: {
                type: String,
                enum: ['Polished', 'Matte', 'Brushed', 'Textured', 'Mixed'],
            },
            dominantColor: {
                type: String,
            },
            estimatedWeight: {
                type: String,
                enum: ['Light', 'Medium', 'Heavy'],
            },
        },
        status: {
            type: String,
            enum: ['Processing', 'Completed', 'Failed', 'Deleted'],
            default: 'Processing',
        },
        processedAt: {
            type: Date,
        },
        deletedAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

// Auto-delete images after 24 hours
imageSessionSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });

const ImageSession = mongoose.model('ImageSession', imageSessionSchema);

export default ImageSession;
