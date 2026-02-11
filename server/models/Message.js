import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
    {
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        recipientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: false, // Optional for broadcast or shared context
        },
        content: {
            type: String,
            required: true,
            trim: true,
        },
        contextType: {
            type: String,
            enum: ['Cart', 'Quotation'],
            required: true,
        },
        contextId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            refPath: 'contextModel',
        },
        contextModel: {
            type: String,
            required: true,
            enum: ['IntendedCart', 'Quotation'],
        },
        attachments: [
            {
                url: String,
                fileName: String,
                fileType: String,
            },
        ],
        isRead: {
            type: Boolean,
            default: false,
        },
        readAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes for fast lookup
messageSchema.index({ contextType: 1, contextId: 1 });
messageSchema.index({ senderId: 1 });
messageSchema.index({ recipientId: 1 });

const Message = mongoose.model('Message', messageSchema);

export default Message;
