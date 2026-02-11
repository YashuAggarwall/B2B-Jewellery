import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import quotationService from '../services/quotation.js';
import { auditLogger } from '../middleware/auditLogger.js';
import Quotation from '../models/Quotation.js';
import pdfService from '../services/pdfService.js';

const router = express.Router();

/**
 * @route   GET /api/quotations
 * @desc    Get all quotations
 * @access  Private (Sales, Admin, External)
 */
router.get('/', protect, authorize('Sales', 'Admin', 'External'), async (req, res) => {
    try {
        const filters = {
            status: req.query.status,
            userId: req.user.role === 'External' ? req.user.id : req.query.userId,
            createdBy: req.query.createdBy,
        };

        const quotations = await quotationService.getAll(filters);

        res.status(200).json({
            success: true,
            data: quotations,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

/**
 * @route   POST /api/quotations/generate
 * @desc    Generate quotation from cart
 * @access  Private (Sales, Admin)
 */
router.post('/generate', protect, authorize('Sales', 'Admin'), auditLogger('Generate Quotation', 'Quotation'), async (req, res) => {
    try {
        const { cartId, notes, validDays } = req.body;

        if (!cartId) {
            return res.status(400).json({
                success: false,
                message: 'Cart ID is required',
            });
        }

        const quotation = await quotationService.generateQuotation(cartId, req.user.id, {
            notes,
            validDays: validDays ? parseInt(validDays) : 30
        });

        res.status(201).json({
            success: true,
            data: quotation,
            message: 'Quotation generated successfully',
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
});

/**
 * @route   GET /api/quotations/cart/:cartId
 * @desc    Get quotation for cart
 * @access  Private
 */
router.get('/cart/:cartId', protect, async (req, res) => {
    try {
        const quotation = await quotationService.getQuotationByCartId(req.params.cartId);

        if (!quotation) {
            return res.status(404).json({
                success: false,
                message: 'Quotation not found',
            });
        }

        res.status(200).json({
            success: true,
            data: quotation,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

/**
 * @route   GET /api/quotations/:id
 * @desc    Get quotation by ID
 * @access  Private
 */
router.get('/:id', protect, async (req, res) => {
    try {
        const quotation = await Quotation.findById(req.params.id)
            .populate('userId', 'name email company')
            .populate('createdBy', 'name email');

        if (!quotation) {
            return res.status(404).json({
                success: false,
                message: 'Quotation not found',
            });
        }

        // Ownership check for External users
        if (req.user.role === 'External' && quotation.userId._id.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this quotation',
            });
        }

        res.status(200).json({
            success: true,
            data: quotation,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

/**
 * @route   GET /api/quotations/:id/download
 * @desc    Download quotation as PDF
 * @access  Private (Sales, Admin, or Owner)
 */
router.get('/:id/download', protect, async (req, res) => {
    try {
        const quotation = await Quotation.findById(req.params.id)
            .populate('userId', 'name email company')
            .populate('createdBy', 'name email');

        if (!quotation) {
            return res.status(404).json({
                success: false,
                message: 'Quotation not found',
            });
        }

        // Authorization check
        const isOwner = quotation.userId._id.toString() === req.user.id;
        const isSalesOrAdmin = ['Sales', 'Admin'].includes(req.user.role);

        if (!isOwner && !isSalesOrAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to download this quotation',
            });
        }

        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader(
            'Content-Disposition',
            `attachment; filename=Quotation-${quotation.quotationNumber}.pdf`
        );

        // Generate and stream PDF
        await pdfService.generateQuotationPDF(quotation, res);
    } catch (error) {
        console.error('PDF Generation Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate PDF',
        });
    }
});

/**
 * @route   PUT /api/quotations/:id/send
 * @desc    Send quotation to customer
 * @access  Private (Sales, Admin)
 */
router.put('/:id/send', protect, authorize('Sales', 'Admin'), async (req, res) => {
    try {
        const quotation = await quotationService.sendQuotation(req.params.id);

        res.status(200).json({
            success: true,
            data: quotation,
            message: 'Quotation sent successfully',
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
});

/**
 * @route   PUT /api/quotations/:id/revise
 * @desc    Create quotation revision
 * @access  Private (Sales, Admin)
 */
router.put('/:id/revise', protect, authorize('Sales', 'Admin'), auditLogger('Revise Quotation', 'Quotation'), async (req, res) => {
    try {
        const { changes } = req.body;

        const quotation = await quotationService.createRevision(
            req.params.id,
            changes,
            req.user.id
        );

        res.status(200).json({
            success: true,
            data: quotation,
            message: 'Quotation revised successfully',
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
});

/**
 * @route   PUT /api/quotations/:id/approve
 * @desc    Approve quotation
 * @access  Private (Sales, Admin, External)
 */
router.put('/:id/approve', protect, authorize('Sales', 'Admin', 'External'), auditLogger('Approve Quotation', 'Quotation'), async (req, res) => {
    try {
        // Ownership check for External users
        const quotation = await Quotation.findById(req.params.id);
        if (!quotation) {
            return res.status(404).json({ success: false, message: 'Quotation not found' });
        }

        if (req.user.role === 'External' && quotation.userId.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Not authorized to approve this quotation' });
        }

        const updatedQuotation = await quotationService.approveQuotation(req.params.id, req.user.id);

        res.status(200).json({
            success: true,
            data: updatedQuotation,
            message: 'Quotation approved successfully',
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
});

/**
 * @route   PUT /api/quotations/:id/reject
 * @desc    Reject quotation
 * @access  Private (Sales, Admin, External)
 */
router.put('/:id/reject', protect, authorize('Sales', 'Admin', 'External'), async (req, res) => {
    try {
        const { reason } = req.body;

        // Ownership check for External users
        const quotation = await Quotation.findById(req.params.id);
        if (!quotation) {
            return res.status(404).json({ success: false, message: 'Quotation not found' });
        }

        if (req.user.role === 'External' && quotation.userId.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Not authorized to reject this quotation' });
        }

        const updatedQuotation = await quotationService.rejectQuotation(req.params.id, reason);

        res.status(200).json({
            success: true,
            data: updatedQuotation,
            message: 'Quotation rejected',
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
});

export default router;
