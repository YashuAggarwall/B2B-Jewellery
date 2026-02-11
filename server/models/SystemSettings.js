import mongoose from 'mongoose';

const systemSettingsSchema = new mongoose.Schema({
    key: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    value: {
        type: mongoose.Schema.Types.Mixed,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        enum: ['General', 'Pricing', 'API', 'Communication'],
        default: 'General',
    },
    lastModifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
}, {
    timestamps: true,
});

const SystemSettings = mongoose.model('SystemSettings', systemSettingsSchema);

export default SystemSettings;
