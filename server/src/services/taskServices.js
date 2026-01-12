const Task = require('../models/Task');
const Activity = require('../models/Activity');
const notificationService = require('../services/notificationServices');
const { ApiError } = require('../utils/apiResponse');

class TaskService {

    async createTaskAndNotify(taskData, creatorId) {

        // create the atsk in DB
        const task = await Task.create(taskData);

        // log activity
        await Activity.create({
            project: task.project,
            user: creatorId,
            action: `Created Task: "${task.title}"`
        });

        // if assigned to someone else, send a real time notification
        if (task.assignedTo && task.assignedTo.toString() !== creatorId.toString()) {
            await notificationService.notifyTaskAssignment(
                task.assignedTo,
                creatorId,
                task.title
            );
        }

        return task;
    }

    async updateStatus(taskId, status, userId) {

        const task = await Task.findById(taskId);
        if (!task) throw new ApiError('Task not found', 404);

        const oldStatus = task.status;
        task.status = status;
        await task.save();

        await Activity.create({
            project: task.project,
            user: userId,
            action: `Chaned status of "${task.title}" from ${oldStatus} to ${status}`
        });

        return task;
    }

    async getTaskStats(projectId) {
        const tasks = await Task.find({ project: projectId });
        const stats = {
            todo: tasks.filter(t => t.status === 'To-Do').length,
            inProgress: tasks.filter(t => t.status === 'In-Progress').length,
            review: tasks.filter(t => t.status === 'Review-Requested').length,
            merged: tasks.filter(t => t.status === 'Merged').length,
            total: tasks.length
        };

        return stats;
    }
}

module.exports = new TaskService();