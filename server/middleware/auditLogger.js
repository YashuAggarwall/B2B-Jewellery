import AuditLog from '../models/AuditLog.js';

// Middleware to log actions
export const auditLogger = (action, entityType = null) => {
    return async (req, res, next) => {
        // Store original json method
        const originalJson = res.json;

        // Override json method to capture response
        res.json = function (data) {
            // Log the action after successful response
            if (res.statusCode >= 200 && res.statusCode < 300) {
                const logData = {
                    userId: req.user?._id,
                    userRole: req.user?.role,
                    action,
                    entityType,
                    entityId: req.params?.id || data?.data?._id,
                    changes: req.body,
                    ipAddress: req.ip || req.connection.remoteAddress,
                    userAgent: req.headers['user-agent'],
                    status: 'Success',
                };

                AuditLog.create(logData).catch(err => {
                    console.error('Audit log error:', err);
                });
            }

            // Call original json method
            return originalJson.call(this, data);
        };

        next();
    };
};

// Log failed actions
export const logFailedAction = async (req, action, error) => {
    try {
        await AuditLog.create({
            userId: req.user?._id,
            userRole: req.user?.role || 'Anonymous',
            action,
            ipAddress: req.ip || req.connection.remoteAddress,
            userAgent: req.headers['user-agent'],
            status: 'Failed',
            errorMessage: error.message,
        });
    } catch (err) {
        console.error('Failed to log error:', err);
    }
};
