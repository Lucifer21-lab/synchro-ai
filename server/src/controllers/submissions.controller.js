const Submission = require('../models/Submission');
const Activity = require('../models/Activity');
const Task = require('../models/Task');
const Project = require('../models/Project');
const { ApiResponse, ApiError } = require('../utils/apiResponse');

// submit work for the assigned task
exports.submitWork = async (req, res, next) => {
    try {
        const { taskId, contentUrl, comment } = req.body;

        // verify task exist and is assigned to this user
        const task = await Task.findById(taskId);
        if (!task) {
            return next(new ApiError('Task not found', 404));
        }

        // create the submission
        const submission = await Submission.create({
            task: taskId,
            submittedBy: req.user.id,
            contentUrl,
            comment
        });

        // Update task status to indicate review is requested
        task.status = 'Review-Requested';
        await task.save();

        // log the activity for the project timeline
        await Activity.create({
            project: task.project,
            user: req.user.id,
            action: `Submitted task work for the review: "${task.title}"`
        });

        res.status(201).json(new ApiResponse(
            submission,
            'Work submitted successfully for review',
            201
        ));
    } catch (error) {
        next(error);
    }
};

exports.mergeWork = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { aiReview } = req.body;

        // find the submission and populate related task
        const submission = await Submission.findById(id).populate('task');
        if (!submission) {
            return next(new ApiError('Submission not found', 404));
        }

        submission.aiReview = aiReview;
        submission.status = 'Approved';
        await submission.save();

        // finalize the task
        const task = submission.task;
        task.status = 'Merged';
        task.mergedBy = req.user.id;
        await task.save();

        // log the final merge activity
        await Activity.create({
            project: task.project,
            user: req.user.id,
            action: `Merged work for the task : ${task.title}`
        })

        res.status(200).json(new ApiResponse(
            { submission, task },
            'Work successfully merged into project'
        ));
    } catch (error) {
        next(error);
    }
};

exports.getTaskSubmissions = async (req, res, next) => {
    try {
        const { taskId } = req.params;

        const submissions = await Submission.find({ task: taskId })
            .populate('submittedBy', 'name, email, avatar')
            .sort({ createdAt: -1 });

        res.status(201).json(new ApiResponse(
            submissions,
            'task submissions retrieved successfully'
        ));
    }
    catch (error) {
        next(error);
    }
}