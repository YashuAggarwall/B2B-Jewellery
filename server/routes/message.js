import express from 'express';
import { protect } from '../middleware/auth.js';
import messageService from '../services/messageService.js';

const router = express.Router();

/**
 * @route   GET /api/messages/:contextType/:contextId
 * @desc    Get conversation history
 * @access  Private
 */
router.get('/:contextType/:contextId', protect, async (req, res) => {
    try {
        const history = await messageService.getConversation(
            req.params.contextType,
            req.params.contextId
        );

        res.status(200).json({
            success: true,
            data: history,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

/**
 * @route   POST /api/messages
 * @desc    Send a new message
 * @access  Private
 */
router.post('/', protect, async (req, res) => {
    try {
        const { content, contextType, contextId } = req.body;

        const message = await messageService.sendMessage({
            senderId: req.user.id,
            content,
            contextType,
            contextId
        });

        res.status(201).json({
            success: true,
            data: message,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
});

/**
 * @route   PUT /api/messages/:contextType/:contextId/read
 * @desc    Mark messages as read
 * @access  Private
 */
router.put('/:contextType/:contextId/read', protect, async (req, res) => {
    try {
        await messageService.markAsRead(
            req.params.contextType,
            req.params.contextId,
            req.user.id
        );

        res.status(200).json({
            success: true,
            message: 'Messages marked as read',
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

export default router;
