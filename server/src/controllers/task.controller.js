const Task = require('../models/Task');
const Activity = require('../models/Activity');
const { ApiResponse, ApiError } = require('../utils/apiResponse');

// create task and assign it to the user
exports.createTask = async (req, res, next) => {
    try {
        const { project, title, description, assignedTo, priority, deadline } = req.body;
        const task = await Task.create({
            project,
            title,
            description,
            assignedTo,
            priority,
            deadline
        });

        await Activity.create({
            project,
            user: req.user.id,
            action: `Created Task: "${title}"`
        });

        res.status(201).json(new ApiResponse(task, 'Task created succesfully', 201));
    }
    catch (error) {
        next(error);
    }
};

// get all task for a specific task
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