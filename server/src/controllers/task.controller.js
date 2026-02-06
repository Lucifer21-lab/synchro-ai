const Task = require('../models/Task');
const Activity = require('../models/Activity');
const { ApiResponse, ApiError } = require('../utils/apiResponse');
const { taskService } = require('../services/taskServices');

// Create Task (Sends Invite if assigned)
exports.createTask = async (req, res, next) => {
    try {
        const { title, description, assignedTo, priority, deadline, projectId } = req.body;

        const task = await Task.create({
            title,
            description,
            project: projectId,
            createdBy: req.user._id,
            priority,
            deadline,
            assignedTo: assignedTo || null,
            // If assigned immediately, status is Pending (Invite)
            assignmentStatus: assignedTo ? 'Pending' : 'None'
        });

        // Log Activity
        await Activity.create({
            project: projectId,
            user: req.user._id,
            action: assignedTo
                ? `Created task "${title}" and invited a member`
                : `Created task "${title}"`
        });

        res.status(201).json(new ApiResponse(task, 'Task created successfully'));
    } catch (error) {
        next(error);
    }
};

// Assignee Accepts or Rejects Invite
exports.respondToInvite = async (req, res, next) => {
    try {
        const { response } = req.body; // 'Accept' or 'Reject'
        const task = await Task.findById(req.params.id);

        if (!task) return next(new ApiError('Task not found', 404));

        // Check if the user responding is actually the one assigned
        if (task.assignedTo.toString() !== req.user._id.toString()) {
            return next(new ApiError('Not authorized to respond to this task', 403));
        }

        if (response === 'Accept') {
            task.assignmentStatus = 'Active';
            await task.save();
            await Activity.create({
                project: task.project,
                user: req.user._id,
                action: `Accepted assignment for task "${task.title}"`
            });
            res.status(200).json(new ApiResponse(task, 'Task accepted'));
        }
        else if (response === 'Reject') {
            // Remove assignment
            task.assignedTo = null;
            task.assignmentStatus = 'None';
            await task.save();
            await Activity.create({
                project: task.project,
                user: req.user._id,
                action: `Rejected assignment for task "${task.title}"`
            });
            res.status(200).json(new ApiResponse(task, 'Task rejected'));
        } else {
            return next(new ApiError('Invalid response', 400));
        }
    } catch (error) {
        next(error);
    }
};

// Assignee Requests to Leave
exports.requestLeave = async (req, res, next) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return next(new ApiError('Task not found', 404));

        if (task.assignedTo.toString() !== req.user._id.toString()) {
            return next(new ApiError('You are not assigned to this task', 403));
        }

        task.leaveRequested = true;
        await task.save();

        // Notification could be sent to owner here (omitted for brevity)

        res.status(200).json(new ApiResponse(task, 'Leave request sent to owner'));
    } catch (error) {
        next(error);
    }
};

// Owner Approves or Rejects Leave Request
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
            task.assignmentStatus = 'None';
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

// get all task for a specific project
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

// update task status
exports.updateTaskStatus = async (req, res, next) => {
    try {
        const { status } = req.body;

        // find and update task
        const task = await Task.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true, runValidators: true }
        );

        if (!task) {
            return next(new ApiError('Task not found', 404));
        }

        // log status changes in activities
        await Activity.create({
            project: task.project,
            user: req.user.id,
            action: `Updated status of ${task.title} to ${status}`
        });

        res.status(200).json(new ApiResponse(task, `Task status updated to ${status}`));
    } catch (error) {
        next(error);
    }
};

// Get all tasks assigned to the current user across all projects

exports.getMyTasks = async (req, res, next) => {
    try {
        // Find tasks assigned to user, exclude merged/completed if needed
        const tasks = await Task.find({
            assignedTo: req.user.id,
            status: { $ne: 'Merged' } // $ne means "not equal"
        })
            .populate('project', 'title description') // Include project info
            .sort({ deadline: 1 }); // Sort by upcoming deadlines

        res.status(200).json(new ApiResponse(
            tasks,
            'Your personal task list retrieved successfully'
        ));
    } catch (error) {
        next(error);
    }
};