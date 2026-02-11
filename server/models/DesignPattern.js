import mongoose from 'mongoose';

const designPatternSchema = new mongoose.Schema(
    {
        patternId: {
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
        shape: {
            type: String,
            enum: ['Round', 'Oval', 'Square', 'Rectangular', 'Heart', 'Pear', 'Marquise', 'Cushion', 'Other'],
        },
        stoneDensity: {
            type: String,
            enum: ['None', 'Sparse', 'Medium', 'Dense'],
        },
        metalVisibility: {
            type: String,
            enum: ['High', 'Medium', 'Low', 'None'],
        },
        finish: {
            type: String,
            enum: ['Polished', 'Matte', 'Brushed', 'Textured', 'Mixed'],
        },
        occasion: {
            type: String,
            enum: ['Casual', 'Formal', 'Wedding', 'Party', 'Everyday', 'Statement'],
        },
        style: {
            type: String,
            enum: ['Classic', 'Modern', 'Vintage', 'Minimalist', 'Ornate', 'Bohemian'],
        },
        tags: [String],
        similarityScore: {
            type: Number,
            min: 0,
            max: 100,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes for efficient pattern matching
designPatternSchema.index({ category: 1, shape: 1, stoneDensity: 1 });
designPatternSchema.index({ tags: 1 });
designPatternSchema.index({ isActive: 1 });

const DesignPattern = mongoose.model('DesignPattern', designPatternSchema);

export default DesignPattern;
