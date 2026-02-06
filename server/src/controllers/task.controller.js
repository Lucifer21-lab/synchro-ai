const Task = require('../models/Task');
const Activity = require('../models/Activity');
const { ApiResponse, ApiError } = require('../utils/apiResponse');
// IMPORT THE SERVICE
const taskService = require('../services/taskServices');

// 1. Create Task (Delegates to Service for Email & Notifications)
exports.createTask = async (req, res, next) => {
    try {
        // We pass the whole body (which may contain assigneeEmail) and creator ID
        const task = await taskService.createTaskAndNotify(req.body, req.user._id);

        res.status(201).json(new ApiResponse(task, 'Task created successfully'));
    } catch (error) {
        next(error);
    }
};

// 2. Respond to Assignment (Accept/Decline)
// Renamed to match the route we defined: respondToTaskAssignment
exports.respondToTaskAssignment = async (req, res, next) => {
    try {
        const { response } = req.body; // 'accept' or 'decline'

        // Use service to handle logic and activity logging
        const task = await taskService.respondToAssignment(req.params.id, req.user._id, response);

        res.status(200).json(new ApiResponse(task, `Task assignment ${response}ed successfully`));
    } catch (error) {
        next(error);
    }
};

// 3. Update Task Status (Delegates to Service to check for Acceptance first)
exports.updateTaskStatus = async (req, res, next) => {
    try {
        const { status } = req.body;

        // Service ensures user has 'Accepted' the task before moving it
        const task = await taskService.updateStatus(req.params.id, status, req.user._id);

        res.status(200).json(new ApiResponse(task, `Task status updated to ${status}`));
    } catch (error) {
        next(error);
    }
};

// --- READ OPERATIONS (Keep as direct DB calls for now) ---

// Get all tasks for a specific project
exports.getProjectTasks = async (req, res, next) => {
    try {
        const tasks = await Task.find({ project: req.params.projectId })
            .populate('assignedTo', 'name email avatar')
            .sort({ createdAt: -1 });

        res.status(200).json(new ApiResponse(tasks, 'Project task retrieved successfully'));
    } catch (error) {
        next(error);
    }
};

// Get all tasks assigned to the current user
exports.getMyTasks = async (req, res, next) => {
    try {
        const tasks = await Task.find({
            assignedTo: req.user._id,
            // Optional: You might want to filter out 'Declined' tasks here if they aren't cleaned up immediately
            assignmentStatus: { $ne: 'Declined' }
        })
            .populate('project', 'title description')
            .sort({ deadline: 1 });

        res.status(200).json(new ApiResponse(tasks, 'User tasks fetched successfully'));
    } catch (error) {
        next(error);
    }
};

// --- LEAVE REQUEST LOGIC (Keep existing logic) ---

exports.requestLeave = async (req, res, next) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return next(new ApiError('Task not found', 404));

        if (task.assignedTo.toString() !== req.user._id.toString()) {
            return next(new ApiError('You are not assigned to this task', 403));
        }

        task.leaveRequested = true;
        await task.save();

        res.status(200).json(new ApiResponse(task, 'Leave request sent to owner'));
    } catch (error) {
        next(error);
    }
};

exports.handleLeaveRequest = async (req, res, next) => {
    try {
        const { action } = req.body; // 'Approve' or 'Reject'
        const task = await Task.findById(req.params.id);

        if (!task) return next(new ApiError('Task not found', 404));

        // Only Task Creator (Owner) can decide
        if (task.createdBy.toString() !== req.user._id.toString()) {
            return next(new ApiError('Only task owner can handle leave requests', 403));
        }

        if (!task.leaveRequested) {
            return next(new ApiError('No leave request exists for this task', 400));
        }

        if (action === 'Approve') {
            task.assignedTo = null;
            task.assignmentStatus = 'None'; // Reset status
            task.leaveRequested = false;
            await task.save();
            res.status(200).json(new ApiResponse(task, 'Leave request approved. Task is now unassigned.'));
        }
        else if (action === 'Reject') {
            task.leaveRequested = false;
            await task.save();
            res.status(200).json(new ApiResponse(task, 'Leave request rejected. User stays assigned.'));
        } else {
            return next(new ApiError('Invalid action', 400));
        }
    } catch (error) {
        next(error);
    }
};