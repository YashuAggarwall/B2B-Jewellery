import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import adminService from '../services/admin.js';
import { auditLogger } from '../middleware/auditLogger.js';

const router = express.Router();

/**
 * MARGIN CONFIGURATION ROUTES
 */

/**
 * @route   GET /api/admin/margins
 * @desc    Get margin configurations
 * @access  Private (Admin)
 */
router.get('/margins', protect, authorize('Admin'), async (req, res) => {
    try {
        const filters = {
            isActive: req.query.isActive,
            applicationType: req.query.applicationType,
        };

        const margins = await adminService.getMarginConfigs(filters);

        res.status(200).json({
            success: true,
            data: margins,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

/**
 * @route   POST /api/admin/margins
 * @desc    Create margin configuration
 * @access  Private (Admin)
 */
router.post('/margins', protect, authorize('Admin'), auditLogger('Create Margin Config', 'MarginConfig'), async (req, res) => {
    try {
        const margin = await adminService.createMarginConfig(req.body, req.user.id);

        res.status(201).json({
            success: true,
            data: margin,
            message: 'Margin configuration created successfully',
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
});

/**
 * @route   PUT /api/admin/margins/:id
 * @desc    Update margin configuration
 * @access  Private (Admin)
 */
router.put('/margins/:id', protect, authorize('Admin'), auditLogger('Update Margin Config', 'MarginConfig'), async (req, res) => {
    try {
        const margin = await adminService.updateMarginConfig(
            req.params.id,
            req.body,
            req.user.id
        );

        res.status(200).json({
            success: true,
            data: margin,
            message: 'Margin configuration updated successfully',
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
});

/**
 * @route   DELETE /api/admin/margins/:id
 * @desc    Delete margin configuration
 * @access  Private (Admin)
 */
router.delete('/margins/:id', protect, authorize('Admin'), async (req, res) => {
    try {
        await adminService.deleteMarginConfig(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Margin configuration deleted successfully',
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
});

/**
 * USER MANAGEMENT ROUTES
 */

/**
 * @route   GET /api/admin/users
 * @desc    Get all users
 * @access  Private (Admin)
 */
router.get('/users', protect, authorize('Admin'), async (req, res) => {
    try {
        const filters = {
            role: req.query.role,
            isActive: req.query.isActive,
        };

        const users = await adminService.getUsers(filters);

        res.status(200).json({
            success: true,
            data: users,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

/**
 * @route   PUT /api/admin/users/:id/role
 * @desc    Update user role
 * @access  Private (Admin)
 */
router.put('/users/:id/role', protect, authorize('Admin'), auditLogger('Update User Role', 'User'), async (req, res) => {
    try {
        const { role } = req.body;

        const user = await adminService.updateUserRole(req.params.id, role);

        res.status(200).json({
            success: true,
            data: user,
            message: 'User role updated successfully',
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
});

/**
 * @route   PUT /api/admin/users/:id/toggle-status
 * @desc    Activate/deactivate user
 * @access  Private (Admin)
 */
router.put('/users/:id/toggle-status', protect, authorize('Admin'), async (req, res) => {
    try {
        const user = await adminService.toggleUserStatus(req.params.id);

        res.status(200).json({
            success: true,
            data: user,
            message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
});

/**
 * AUDIT LOG ROUTES
 */

/**
 * @route   GET /api/admin/audit-logs
 * @desc    Get audit logs
 * @access  Private (Admin)
 */
router.get('/audit-logs', protect, authorize('Admin'), async (req, res) => {
    try {
        const filters = {
            userId: req.query.userId,
            action: req.query.action,
            entityType: req.query.entityType,
            status: req.query.status,
            dateFrom: req.query.dateFrom,
            dateTo: req.query.dateTo,
        };

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;

        const result = await adminService.getAuditLogs(filters, page, limit);

        res.status(200).json({
            success: true,
            data: result.logs,
            pagination: result.pagination,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

/**
 * SYSTEM STATISTICS
 */

/**
 * @route   GET /api/admin/stats
 * @desc    Get system statistics
 * @access  Private (Admin)
 */
router.get('/stats', protect, authorize('Admin'), async (req, res) => {
    try {
        const stats = await adminService.getSystemStats();

        res.status(200).json({
            success: true,
            data: stats,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

/**
 * SYSTEM SETTINGS ROUTES
 */

/**
 * @route   GET /api/admin/settings
 * @desc    Get all system settings
 * @access  Private (Admin)
 */
router.get('/settings', protect, authorize('Admin'), async (req, res) => {
    try {
        const settings = await adminService.getSystemSettings();
        res.status(200).json({
            success: true,
            data: settings,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

/**
 * @route   PUT /api/admin/settings/:key
 * @desc    Update system setting
 * @access  Private (Admin)
 */
router.put('/settings/:key', protect, authorize('Admin'), auditLogger('Update System Setting', 'SystemSettings'), async (req, res) => {
    try {
        const { value } = req.body;
        const setting = await adminService.updateSystemSetting(req.params.key, value, req.user.id);
        res.status(200).json({
            success: true,
            data: setting,
            message: 'Setting updated successfully',
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
});

/**
 * EMAIL TEMPLATE ROUTES
 */

/**
 * @route   GET /api/admin/email-templates
 * @desc    Get all email templates
 * @access  Private (Admin)
 */
router.get('/email-templates', protect, authorize('Admin'), async (req, res) => {
    try {
        const templates = await adminService.getEmailTemplates();
        res.status(200).json({
            success: true,
            data: templates,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

/**
 * @route   PUT /api/admin/email-templates/:id
 * @desc    Update email template
 * @access  Private (Admin)
 */
router.put('/email-templates/:id', protect, authorize('Admin'), auditLogger('Update Email Template', 'EmailTemplate'), async (req, res) => {
    try {
        const template = await adminService.updateEmailTemplate(req.params.id, req.body, req.user.id);
        res.status(200).json({
            success: true,
            data: template,
            message: 'Email template updated successfully',
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
});

export default router;
