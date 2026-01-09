const Activity = require('../models/Activity');
const { ApiResponse, ApiError } = require('../utils/apiResponse');

// get all activity logs for a specific project
exports.getProjectActivities = async (req, res, next) => {
    try {
        const { projectId } = req.params;

        const activities = await Activity.find({ project: projectId })
            .populate('user', 'name email avatar')
            .sort({ createdAt: -1 });

        res.status(201).json(new ApiResponse(
            activities,
            'Project activity logs retrieved successfully'
        ));
    }
    catch (error) {
        next(error);
    }
}

exports.getUserActivities = async (req, res, next) => {
    try {
        const activities = await Activity.find({ user: req.user.id })
            .populate('project', 'title')
            .sort({ createdAt: -1 });

        res.status(201).json(new ApiResponse(
            activities,
            'Personal activity logs retrieved successfully'
        ));
    } catch (error) {
        next(error);
    }
}