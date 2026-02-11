import Message from '../models/Message.js';
import IntendedCart from '../models/IntendedCart.js';
import Quotation from '../models/Quotation.js';

/**
 * Message Service
 * Handles communication between Sales and Customers
 */
class MessageService {
    /**
     * Send a message
     */
    async sendMessage(data) {
        const { senderId, content, contextType, contextId } = data;

        // Verify context exists
        let contextModel = contextType === 'Cart' ? 'IntendedCart' : 'Quotation';
        const ContextModel = contextType === 'Cart' ? IntendedCart : Quotation;

        const context = await ContextModel.findById(contextId);
        if (!context) {
            throw new Error(`${contextType} not found`);
        }

        // Determine recipient (the other party in the context)
        // If sender is Sales/Admin, recipient is the cart/quotation owner (External)
        // If sender is External, recipient is the assigned sales person (if any) or remains null for broadcast
        const message = await Message.create({
            senderId,
            content,
            contextType,
            contextId,
            contextModel
        });

        return await message.populate('senderId', 'name email role');
    }

    /**
     * Get conversation history
     */
    async getConversation(contextType, contextId) {
        return await Message.find({ contextType, contextId })
            .populate('senderId', 'name email role')
            .sort({ createdAt: 1 });
    }

    /**
     * Mark context messages as read for a user
     */
    async markAsRead(contextType, contextId, userId) {
        return await Message.updateMany(
            {
                contextType,
                contextId,
                senderId: { $ne: userId },
                isRead: false
            },
            {
                isRead: true,
                readAt: new Date()
            }
        );
    }
}

export default new MessageService();
