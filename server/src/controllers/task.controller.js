const Task = require('../models/Task');
const Activity = require('../models/Activity');
const Project = require('../models/Project'); // Ensure Project is imported
const { ApiResponse, ApiError } = require('../utils/apiResponse');
const taskService = require('../services/taskServices');

// 1. Create Task (Restricted to Project Owner)
exports.createTask = async (req, res, next) => {
    try {
        const { projectId } = req.body;

        // 1. Validation: Project ID is required
        if (!projectId) {
            return next(new ApiError('Project ID is required to create a task', 400));
        }

        // 2. Fetch Project
        const project = await Project.findById(projectId);
        if (!project) {
            return next(new ApiError('Project not found', 404));
        }

        // 3. Security Check: Only Owner can create tasks
        if (project.owner.toString() !== req.user._id.toString()) {
            return next(new ApiError('Not authorized. Only the project owner can create tasks.', 403));
        }

        // 4. Proceed with creation (Service handles notifications)
        // Ensure projectId is part of the body passed to service if it wasn't already
        const taskData = { ...req.body, project: projectId };
        const task = await taskService.createTaskAndNotify(taskData, req.user._id);

        res.status(201).json(new ApiResponse(task, 'Task created successfully'));
    } catch (error) {
        next(error);
    }
};

// 2. Respond to Assignment (Accept/Decline)
exports.respondToTaskAssignment = async (req, res, next) => {
    try {
        const { response } = req.body; // 'accept' or 'decline'

        if (!['accept', 'decline'].includes(response)) {
            return next(new ApiError('Invalid response. Must be "accept" or "decline".', 400));
        }

        // Use service to handle logic and activity logging
        const task = await taskService.respondToAssignment(req.params.id, req.user._id, response);

        // Fix grammar for response message
        const actionVerb = response === 'accept' ? 'accepted' : 'declined';

        res.status(200).json(new ApiResponse(task, `Task assignment ${actionVerb} successfully`));
    } catch (error) {
        next(error);
    }
};

// 3. Update Task Status
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

// --- READ OPERATIONS ---

// Get all tasks for a specific project
exports.getProjectTasks = async (req, res, next) => {
    try {
        const tasks = await Task.find({ project: req.params.projectId })
            .populate('assignedTo', 'name email avatar')
            .sort({ createdAt: -1 });

        res.status(200).json(new ApiResponse(tasks, 'Project tasks retrieved successfully'));
    } catch (error) {
        next(error);
    }
};

// Get all tasks assigned to the current user
exports.getMyTasks = async (req, res, next) => {
    try {
        const tasks = await Task.find({
            assignedTo: req.user._id,
            assignmentStatus: { $ne: 'Declined' }
        })
            .populate('project', 'title description')
            .sort({ deadline: 1 });

        res.status(200).json(new ApiResponse(tasks, 'User tasks fetched successfully'));
    } catch (error) {
        next(error);
    }
};

// --- LEAVE REQUEST LOGIC ---

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