const Notification = require('../models/Notification');
const Activity = require('../models/Activity');
const { ApiResponse, ApiError } = require('../utils/apiResponse');

// Get all notifications for the logged-in user
exports.getNotifications = async (req, res, next) => {
    try {
        // Retrieve notifications for the current user, latest first
        const notifications = await Notification.find({ recipient: req.user._id })
            .populate('sender', 'name avatar')
            .sort({ createdAt: -1 });

        res.status(200).json(new ApiResponse(
            notifications,
            'Notifications retrieved successfully'
        ));
    } catch (error) {
        next(error);
    }
};

// Mark a single notification as read
exports.markAsRead = async (req, res, next) => {
    try {
        const notification = await Notification.findByIdAndUpdate(
            req.params.id,
            { isRead: true },
            { new: true }
        );

        if (!notification) {
            return next(new ApiError('Notification not found', 404));
        }

        res.status(200).json(new ApiResponse(
            notification,
            'Notification marked as read'
        ));
    } catch (error) {
        next(error);
    }
};

// Mark all notifications as read for the user
exports.markAllAsRead = async (req, res, next) => {
    try {
        await Notification.updateMany(
            { recipient: req.user._id, isRead: false },
            { isRead: true }
        );

        res.status(200).json(new ApiResponse(
            null,
            'All notifications marked as read'
        ));
    } catch (error) {
        next(error);
    }
};

// Get activity logs for a specific project (Monitoring Timeline)
exports.getActivityLogs = async (req, res, next) => {
    try {
        const { projectId } = req.params;

        // Fetch activity logs to power the "Monitoring Timeline" UI
        const activities = await Activity.find({ project: projectId })
            .populate('user', 'name avatar')
            .sort({ createdAt: -1 });

        res.status(200).json(new ApiResponse(
            activities,
            'Project activity timeline retrieved successfully'
        ));
    } catch (error) {
        next(error);
    }
};