const Task = require('../models/Task');
const User = require('../models/User');
const Activity = require('../models/Activity');
const notificationService = require('../services/notificationServices');
const sendEmail = require('../services/emailServices');
const { ApiError } = require('../utils/apiResponse');

class TaskService {

    // 1. UPDATED: Handle Email Assignment & Send Invite
    async createTaskAndNotify(taskData, creatorId) {

        // Extract email from data, separate from other task fields
        const { assigneeEmail, ...otherData } = taskData;

        let assignedUserId = null;
        let assignmentStatus = 'None'; // Default to None if unassigned

        // A. Resolve Email to User ID
        if (assigneeEmail) {
            const user = await User.findOne({ email: assigneeEmail });
            if (!user) {
                // Throw error if email provided but user not found
                throw new ApiError(`User with email '${assigneeEmail}' not found.`, 404);
            }
            assignedUserId = user._id;

            // If assigning to someone else, status is Pending
            // If assigning to self, status is Accepted (Active)
            if (user._id.toString() !== creatorId.toString()) {
                assignmentStatus = 'Pending';
            } else {
                assignmentStatus = 'Active';
            }
        }

        // B. Create the Task in DB
        const task = await Task.create({
            ...otherData,
            assignedTo: assignedUserId,
            assignmentStatus,
            createdBy: creatorId // <--- FIXED: Added this required field
        });

        // C. Log activity
        await Activity.create({
            project: task.project,
            user: creatorId,
            action: `Created Task: "${task.title}"`
        });

        // D. Send Notification & Email (If assigned to someone else)
        if (assignedUserId && assignmentStatus === 'Pending') {

            // 1. Send Email Invitation
            try {
                const assignee = await User.findById(assignedUserId);
                await sendEmail({
                    email: assignee.email,
                    subject: 'New Task Assignment - Action Required',
                    message: `You have been assigned the task "${task.title}". Please log in to accept or decline.`,
                    html: `
                        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
                            <h2 style="color: #4F46E5;">New Task Assignment</h2>
                            <p>You have been assigned to the task: <strong>${task.title}</strong></p>
                            <p>Status: <span style="color:orange; font-weight:bold;">Pending Acceptance</span></p>
                            <p>Please log in to your dashboard to Accept or Decline this task.</p>
                            <br/>
                            <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/" style="background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Go to Dashboard</a>
                        </div>
                    `
                });
            } catch (err) {
                console.error("Failed to send task email:", err);
                // We do NOT throw error here, so the task creation doesn't fail just because email failed
            }

            // 2. Send Real-time Notification
            await notificationService.notifyTaskAssignment(
                assignedUserId,
                creatorId,
                task.title
            );
        }

        return task;
    }

    // 2. Handle Accept/Decline
    async respondToAssignment(taskId, userId, response) {
        const task = await Task.findById(taskId);
        if (!task) throw new ApiError('Task not found', 404);

        // Security: Ensure the user responding is the one assigned
        if (task.assignedTo?.toString() !== userId.toString()) {
            throw new ApiError('You are not assigned to this task', 403);
        }

        if (response === 'accept') {
            task.assignmentStatus = 'Active'; // Changed from 'Accepted' to 'Active' to match Schema Enum if needed, or keep 'Accepted' if your Schema allows it.
            // Based on your Schema provided earlier: enum: ['Pending', 'Active', 'None']
            // So I used 'Active' here.

            await task.save();

            await Activity.create({
                project: task.project,
                user: userId,
                action: `Accepted assignment for task "${task.title}"`
            });

        } else if (response === 'decline') {
            task.assignedTo = null; // Remove assignment
            task.assignmentStatus = 'None'; // Reset status
            await task.save();

            await Activity.create({
                project: task.project,
                user: userId,
                action: `Declined assignment for task "${task.title}"`
            });
        } else {
            throw new ApiError('Invalid response. Use "accept" or "decline".', 400);
        }

        return task;
    }

    // 3. Update Status
    async updateStatus(taskId, status, userId) {

        const task = await Task.findById(taskId);
        if (!task) throw new ApiError('Task not found', 404);

        // Check: User must accept task before moving it
        if (task.assignmentStatus === 'Pending') {
            throw new ApiError('You must accept the task assignment before working on it.', 400);
        }

        const oldStatus = task.status;
        task.status = status;
        await task.save();

        await Activity.create({
            project: task.project,
            user: userId,
            action: `Changed status of "${task.title}" from ${oldStatus} to ${status}`
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