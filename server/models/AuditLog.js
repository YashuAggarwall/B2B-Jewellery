import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        userRole: {
            type: String,
            required: true,
        },
        action: {
            type: String,
            required: true,
        },
        entityType: {
            type: String,
            enum: [
                'User',
                'ImageSession',
                'DesignPattern',
                'InventoryItem',
                'ManufacturerSKU',
                'IntendedCart',
                'Quotation',
                'MarginConfig',
            ],
        },
        entityId: {
            type: mongoose.Schema.Types.ObjectId,
        },
        changes: {
            type: mongoose.Schema.Types.Mixed,
        },
        ipAddress: {
            type: String,
        },
        userAgent: {
            type: String,
        },
        status: {
            type: String,
            enum: ['Success', 'Failed'],
            default: 'Success',
        },
        errorMessage: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ entityType: 1, entityId: 1 });
auditLogSchema.index({ action: 1, createdAt: -1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

export default AuditLog;
