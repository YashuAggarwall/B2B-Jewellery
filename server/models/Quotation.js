import mongoose from 'mongoose';

const quotationSchema = new mongoose.Schema(
    {
        quotationNumber: {
            type: String,
            required: true,
            unique: true,
        },
        cartId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'IntendedCart',
            required: true,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        lineItems: [
            {
                cartItemId: mongoose.Schema.Types.ObjectId,
                name: String,
                category: String,
                quantity: Number,
                baseCost: Number,
                marginApplied: {
                    marginType: String,
                    percentage: Number,
                    amount: Number,
                },
                unitPrice: Number,
                totalPrice: Number,
                moq: Number,
                leadTimeDays: Number,
                customizationNotes: String,
            },
        ],
        subtotal: {
            type: Number,
            required: true,
        },
        totalMargin: {
            type: Number,
            required: true,
        },
        grandTotal: {
            type: Number,
            required: true,
        },
        version: {
            type: Number,
            default: 1,
        },
        status: {
            type: String,
            enum: ['Draft', 'Sent', 'Approved', 'Rejected', 'Revised'],
            default: 'Draft',
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        sentAt: {
            type: Date,
        },
        approvedAt: {
            type: Date,
        },
        approvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        rejectedAt: {
            type: Date,
        },
        rejectionReason: {
            type: String,
        },
        revisionHistory: [
            {
                version: Number,
                changes: String,
                revisedBy: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User',
                },
                revisedAt: Date,
            },
        ],
        notes: {
            type: String,
        },
        validUntil: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
quotationSchema.index({ cartId: 1 });
quotationSchema.index({ userId: 1 });
quotationSchema.index({ status: 1 });

const Quotation = mongoose.model('Quotation', quotationSchema);

export default Quotation;
