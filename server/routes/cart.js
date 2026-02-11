import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import cartService from '../services/cart.js';
import IntendedCart from '../models/IntendedCart.js';
import { auditLogger } from '../middleware/auditLogger.js';

const router = express.Router();

/**
 * @route   GET /api/cart
 * @desc    Get user's cart
 * @access  Private (External users)
 */
router.get('/', protect, async (req, res) => {
    try {
        const cart = await cartService.getOrCreateCart(req.user.id);

        res.status(200).json({
            success: true,
            data: cart,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

/**
 * @route   GET /api/cart/history
 * @desc    Get user's cart history
 * @access  Private (External users)
 */
router.get('/history', protect, async (req, res) => {
    try {
        const carts = await cartService.getUserCartHistory(req.user.id);

        res.status(200).json({
            success: true,
            data: carts,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

/**
 * @route   POST /api/cart/items
 * @desc    Add item to cart
 * @access  Private (External users)
 */
router.post('/items', protect, auditLogger('Add to Cart', 'IntendedCart'), async (req, res) => {
    try {
        const { recommendationId, quantity, customizationRequests, productDetails } = req.body;

        console.log('🛒 Add to cart request raw body keys:', Object.keys(req.body));
        console.log('🛒 Add to cart request details:', {
            recommendationId,
            quantity,
            hasProductDetails: !!productDetails,
            productDetailsKeys: productDetails ? Object.keys(productDetails) : 'MISSING'
        });

        if (!recommendationId || !quantity) {
            console.log('❌ Missing required fields');
            return res.status(400).json({
                success: false,
                message: 'Recommendation ID and quantity are required',
            });
        }

        const cart = await cartService.addItem(
            req.user.id,
            recommendationId,
            quantity,
            customizationRequests,
            productDetails
        );

        console.log('✅ Item added to cart successfully');

        res.status(200).json({
            success: true,
            data: cart,
            message: 'Item added to cart',
        });
    } catch (error) {
        console.error('❌ Add to cart error:', error.message);
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
});

/**
 * @route   DELETE /api/cart/items/:itemId
 * @desc    Remove item from cart
 * @access  Private (External users)
 */
router.delete('/items/:itemId', protect, async (req, res) => {
    try {
        const cart = await cartService.removeItem(req.user.id, req.params.itemId);

        res.status(200).json({
            success: true,
            data: cart,
            message: 'Item removed from cart',
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
});

/**
 * @route   PUT /api/cart/items/:itemId
 * @desc    Update item quantity
 * @access  Private (External users)
 */
router.put('/items/:itemId', protect, async (req, res) => {
    try {
        const { quantity } = req.body;

        if (!quantity || quantity < 1) {
            return res.status(400).json({
                success: false,
                message: 'Valid quantity is required',
            });
        }

        const cart = await cartService.updateItemQuantity(
            req.user.id,
            req.params.itemId,
            quantity
        );

        res.status(200).json({
            success: true,
            data: cart,
            message: 'Item quantity updated',
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
});

/**
 * @route   POST /api/cart/submit
 * @desc    Submit cart for review
 * @access  Private (External users)
 */
router.post('/submit', protect, auditLogger('Submit Cart', 'IntendedCart'), async (req, res) => {
    try {
        const cart = await cartService.submitCart(req.user.id);

        res.status(200).json({
            success: true,
            data: cart,
            message: 'Cart submitted successfully',
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
});

/**
 * @route   POST /api/cart/:cartId/cancel
 * @desc    Cancel a submitted cart (External users only)
 * @access  Private (External users)
 */
router.post('/:cartId/cancel', protect, async (req, res) => {
    try {
        const cart = await cartService.cancelCart(req.params.cartId, req.user.id);

        res.status(200).json({
            success: true,
            data: cart,
            message: 'Cart cancelled successfully',
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
});

/**
 * @route   GET /api/cart/all
 * @desc    Get all carts (for Sales/Sourcing/Admin)
 * @access  Private (Sales, Sourcing, Admin)
 */
router.get('/all', protect, authorize('Sales', 'Sourcing', 'Admin'), async (req, res) => {
    try {
        const filters = {
            status: req.query.status,
            userId: req.query.userId,
            assignedToSales: req.query.assignedToSales,
            assignedToSourcing: req.query.assignedToSourcing,
        };

        const carts = await cartService.getAllCarts(filters);

        res.status(200).json({
            success: true,
            data: carts,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

/**
 * @route   PUT /api/cart/:cartId/assign
 * @desc    Assign cart to sales/sourcing user
 * @access  Private (Sales, Sourcing, Admin)
 */
router.put('/:cartId/assign', protect, authorize('Sales', 'Sourcing', 'Admin'), async (req, res) => {
    try {
        const { role, userId } = req.body;

        const cart = await cartService.assignCart(req.params.cartId, role, userId);

        res.status(200).json({
            success: true,
            data: cart,
            message: 'Cart assigned successfully',
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
});

/**
 * @route   POST /api/cart/:cartId/notes
 * @desc    Add note to cart
 * @access  Private (Sales, Sourcing, Admin)
 */
router.post('/:cartId/notes', protect, authorize('Sales', 'Sourcing', 'Admin'), async (req, res) => {
    try {
        const { content } = req.body;

        const cart = await cartService.addNote(
            req.params.cartId,
            req.user.id,
            req.user.role,
            content
        );

        res.status(200).json({
            success: true,
            data: cart,
            message: 'Note added successfully',
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
});

/**
 * @route   PUT /api/cart/:cartId/status
 * @desc    Update cart status
 * @access  Private (Sales, Sourcing, Admin)
 */
router.put('/:cartId/status', protect, authorize('Sales', 'Sourcing', 'Admin'), async (req, res) => {
    try {
        const { status, closureReason } = req.body;

        const cart = await cartService.updateStatus(req.params.cartId, status, closureReason);

        res.status(200).json({
            success: true,
            data: cart,
            message: 'Cart status updated',
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
});

/**
 * @route   GET /api/cart/:id
 * @desc    Get cart by ID
 * @access  Private (Sales, Sourcing, Admin)
 */
router.get('/:id', protect, authorize('Sales', 'Sourcing', 'Admin'), async (req, res) => {
    try {
        const cart = await IntendedCart.findById(req.params.id)
            .populate('userId', 'name email company')
            .populate('assignedTo.sales', 'name email')
            .populate('assignedTo.sourcing', 'name email');

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found',
            });
        }

        res.status(200).json({
            success: true,
            data: cart,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

/**
 * @route   PUT /api/cart/:cartId/items/:itemId/status
 * @desc    Update status and notes for a specific item in a cart
 * @access  Private (Sales, Sourcing, Admin)
 */
router.put('/:cartId/items/:itemId/status', protect, authorize('Sales', 'Sourcing', 'Admin'), async (req, res) => {
    try {
        const { status, salesNotes } = req.body;

        const cart = await cartService.updateItemStatus(
            req.params.cartId,
            req.params.itemId,
            status,
            salesNotes
        );

        res.status(200).json({
            success: true,
            data: cart,
            message: 'Item status updated',
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
});

/**
 * @route   PUT /api/cart/:cartId/approve-all
 * @desc    Approve all items in a cart
 * @access  Private (Sales, Sourcing, Admin)
 */
router.put('/:cartId/approve-all', protect, authorize('Sales', 'Sourcing', 'Admin'), async (req, res) => {
    try {
        const cart = await cartService.approveWholeCart(req.params.cartId);

        res.status(200).json({
            success: true,
            data: cart,
            message: 'All items approved successfully',
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
});

/**
 * @route   PUT /api/cart/:cartId/approve
 * @desc    Finalize cart review and mark as Approved
 * @access  Private (Sales, Sourcing, Admin)
 */
router.put('/:cartId/approve', protect, authorize('Sales', 'Sourcing', 'Admin'), async (req, res) => {
    try {
        const cart = await cartService.approveCart(req.params.cartId);

        res.status(200).json({
            success: true,
            data: cart,
            message: 'Cart review finalized and approved',
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
});

export default router;
