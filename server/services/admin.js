import MarginConfig from '../models/MarginConfig.js';
import User from '../models/User.js';
import AuditLog from '../models/AuditLog.js';
import SystemSettings from '../models/SystemSettings.js';
import EmailTemplate from '../models/EmailTemplate.js';

/**
 * Admin Service
 * Manages system configuration, margins, roles, and audit logs
 */

class AdminService {
    /**
     * Get all margin configurations
     */
    async getMarginConfigs(filters = {}) {
        const query = {};

        if (filters.isActive !== undefined) {
            query.isActive = filters.isActive;
        }

        if (filters.applicationType) {
            query.applicationType = filters.applicationType;
        }

        return await MarginConfig.find(query).sort({ priority: -1, createdAt: -1 });
    }

    /**
     * Create margin configuration
     */
    async createMarginConfig(data, createdBy) {
        const marginConfig = await MarginConfig.create({
            ...data,
            createdBy,
            lastModifiedBy: createdBy,
        });

        return marginConfig;
    }

    /**
     * Update margin configuration
     */
    async updateMarginConfig(configId, updates, modifiedBy) {
        const config = await MarginConfig.findById(configId);

        if (!config) {
            throw new Error('Margin configuration not found');
        }

        Object.assign(config, updates);
        config.lastModifiedBy = modifiedBy;
        await config.save();

        return config;
    }

    /**
     * Delete margin configuration
     */
    async deleteMarginConfig(configId) {
        const config = await MarginConfig.findById(configId);

        if (!config) {
            throw new Error('Margin configuration not found');
        }

        // Soft delete - just deactivate
        config.isActive = false;
        await config.save();

        return config;
    }

    /**
     * Get all users
     */
    async getUsers(filters = {}) {
        const query = {};

        if (filters.role) {
            query.role = filters.role;
        }

        if (filters.isActive !== undefined) {
            query.isActive = filters.isActive;
        }

        return await User.find(query).select('-password').sort({ createdAt: -1 });
    }

    /**
     * Update user role
     */
    async updateUserRole(userId, newRole) {
        const user = await User.findById(userId);

        if (!user) {
            throw new Error('User not found');
        }

        const validRoles = ['External', 'Sales', 'Sourcing', 'Admin'];
        if (!validRoles.includes(newRole)) {
            throw new Error('Invalid role');
        }

        user.role = newRole;
        await user.save();

        return user;
    }

    /**
     * Activate/deactivate user
     */
    async toggleUserStatus(userId) {
        const user = await User.findById(userId);

        if (!user) {
            throw new Error('User not found');
        }

        user.isActive = !user.isActive;
        await user.save();

        return user;
    }

    /**
     * Get audit logs
     */
    async getAuditLogs(filters = {}, page = 1, limit = 50) {
        const query = {};

        if (filters.userId) {
            query.userId = filters.userId;
        }

        if (filters.action) {
            query.action = { $regex: filters.action, $options: 'i' };
        }

        if (filters.entityType) {
            query.entityType = filters.entityType;
        }

        if (filters.status) {
            query.status = filters.status;
        }

        if (filters.dateFrom || filters.dateTo) {
            query.createdAt = {};
            if (filters.dateFrom) {
                query.createdAt.$gte = new Date(filters.dateFrom);
            }
            if (filters.dateTo) {
                query.createdAt.$lte = new Date(filters.dateTo);
            }
        }

        const skip = (page - 1) * limit;

        const logs = await AuditLog.find(query)
            .populate('userId', 'name email role')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await AuditLog.countDocuments(query);

        return {
            logs,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        };
    }

    /**
     * Get system statistics
     */
    async getSystemStats() {
        const [
            totalUsers,
            activeUsers,
            totalCarts,
            submittedCarts,
            underReviewCarts,
            approvedCarts,
            quotedCarts,
            inventoryItemsCount,
            quotationsCount,
        ] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ isActive: true }),
            (await import('../models/IntendedCart.js')).default.countDocuments(),
            (await import('../models/IntendedCart.js')).default.countDocuments({ status: 'Submitted' }),
            (await import('../models/IntendedCart.js')).default.countDocuments({ status: 'Under Review' }),
            (await import('../models/IntendedCart.js')).default.countDocuments({ status: 'Approved' }),
            (await import('../models/IntendedCart.js')).default.countDocuments({ status: 'Quoted' }),
            (await import('../models/InventoryItem.js')).default.countDocuments(),
            (await import('../models/Quotation.js')).default.countDocuments(),
        ]);

        return {
            totalUsers,
            activeUsers,
            activeCarts: submittedCarts + underReviewCarts + approvedCarts, // Carts being worked on
            quotations: quotationsCount,
            inventoryItems: inventoryItemsCount,
            carts: {
                total: totalCarts,
                submitted: submittedCarts,
                underReview: underReviewCarts,
                approved: approvedCarts,
                quoted: quotedCarts,
            }
        };
    }

    /**
     * Get all system settings
     */
    async getSystemSettings() {
        return await SystemSettings.find().sort({ category: 1, key: 1 });
    }

    /**
     * Update a system setting
     */
    async updateSystemSetting(key, value, modifiedBy) {
        let setting = await SystemSettings.findOne({ key });

        if (!setting) {
            throw new Error(`System setting ${key} not found`);
        }

        setting.value = value;
        setting.lastModifiedBy = modifiedBy;
        await setting.save();

        return setting;
    }

    /**
     * Get all email templates
     */
    async getEmailTemplates() {
        return await EmailTemplate.find().sort({ name: 1 });
    }

    /**
     * Update an email template
     */
    async updateEmailTemplate(templateId, updates, modifiedBy) {
        const template = await EmailTemplate.findById(templateId);

        if (!template) {
            throw new Error('Email template not found');
        }

        Object.assign(template, updates);
        template.lastModifiedBy = modifiedBy;
        await template.save();

        return template;
    }
}

export default new AdminService();
