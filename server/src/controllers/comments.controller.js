const Comment = require('../models/Comment');
const Task = require('../models/Task');
const { ApiResponse, ApiError } = require('../utils/apiResponse');

// add a comment to a specific task
exports.addComment = async (req, res, next) => {
    try {
        const { taskId, text, attachments } = req.body;

        // Verify the task exists
        const tasks = await Task.findById(taskId);
        if (!tasks) {
            return next(new ApiError('Task not found', 404));
        }

        // create the comment
        const comment = await Comment.create({
            task: taskId,
            user: req.user.id,
            text,
            attachments: attachments || []
        });

        // populate user details for immediate frontend display
        const populateComment = await comment.populate('user', 'name avatar');

        res.status(201).json(new ApiResponse(
            populateComment,
            'Comment added successfully',
            201
        ));
    } catch (error) {
        next(error);
    }
};

// get all comments for a specific task
exports.getTaskComments = async (req, res, next) => {
    try {
        const { taskId } = req.params;

        const comments = await Comment.find({ task: taskId })
            .populate('user', 'name, email, avatar')
            .sort({ createdAt: 1 });

        res.status(200).json(new ApiResponse(
            comments,
            'Task all comments retrieved successfully'
        ));

    } catch (error) {
        next(error);
    }
};

