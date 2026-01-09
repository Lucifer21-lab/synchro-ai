const Notification = require('../models/Notification');
const Activity = require('../models/Activity');
const { ApiResponse } = require('../utils/apiResponse');

// get all notification for the logged in user 
exports.getNotifications = async (req, res, next) => {
    try {

        // retrieve notification for the current users, latest first
        const notification = await Notification.find({ recipient: req.user.id })
            .populate('sender', 'name avatar')
            .sort({ createdAt: -1 });

        res.status(200).json(new ApiResponse(
            notification,
            'Notification retrieved Successfully'
        ));
    } catch (error) {
        next(error);
    }
};

// mark as read notification - single
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

exports.markAllAsRead = async (req, res, next) => {
    try {
        await Notification.updateMany(
            { recipient: req.user.id, isRead: false },
            { isRead: true }
        );

        res.status(200).json(new ApiResponse(
            null,
            'All notifications are marked as read'
        ));
    } catch (error) {
        next(error);
    }
};

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
