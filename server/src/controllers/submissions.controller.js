const Submission = require('../models/Submission');
const Task = require('../models/Task');
const Activity = require('../models/Activity');
const { uploadOnCloudinary } = require('../utils/cloudinaryHelper');
const aiService = require('../services/aiService');
const notificationService = require('../services/notificationService');
const { ApiResponse, ApiError } = require('../utils/apiResponse');

exports.submitWork = async (req, res, next) => {
    try {
        const { taskId, comment } = req.body;
        let contentUrl = req.body.contentUrl;

        // Check if task exists and is valid for submission
        const task = await Task.findById(taskId);
        if (!task) {
            return next(new ApiError('Task not found', 404));
        }

        // Handle File Upload to Cloudinary if a file exists
        if (req.file) {
            const cloudinaryResponse = await uploadOnCloudinary(req.file.path, 'submissions');
            if (cloudinaryResponse) {
                contentUrl = cloudinaryResponse.secure_url;
            }
        }

        if (!contentUrl) {
            return next(new ApiError('Please provide a file or a content URL', 400));
        }

        // Create the submission record
        const submission = await Submission.create({
            task: taskId,
            submittedBy: req.user.id,
            contentUrl,
            comment
        });

        // Update task status to Review-Requested
        task.status = 'Review-Requested';
        await task.save();

        // Log activity and notify the project owner
        await Activity.create({
            project: task.project,
            user: req.user.id,
            action: `Submitted work for task: "${task.title}"`
        });

        res.status(201).json(new ApiResponse(submission, 'Work submitted for review', 201));
    } catch (error) {
        next(error);
    }
};

exports.mergeWork = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Find submission and task
        const submission = await Submission.findById(id).populate('task');
        if (!submission) {
            return next(new ApiError('Submission not found', 404));
        }

        const task = submission.task;

        // Trigger AI Review Service
        // This generates automated feedback and a score before merging
        const aiReviewData = await aiService.reviewSubmission(
            task.project,
            { title: task.title, description: task.description },
            submission.comment + " " + submission.contentUrl
        );

        // Update submission with AI insights
        submission.aiReview = aiReviewData;
        submission.status = 'Approved';
        await submission.save();

        // Finalize Task
        task.status = 'Merged';
        task.mergedBy = req.user.id;
        await task.save();

        // Audit Trail & Real-time Notification
        await Activity.create({
            project: task.project,
            user: req.user.id,
            action: `Merged task: "${task.title}" after AI Review (Score: ${aiReviewData.score})`
        });

        await notificationService.notifyMerge(
            submission.submittedBy,
            req.user.id,
            task.title
        );

        res.status(200).json(new ApiResponse(
            { submission, task },
            'Work successfully merged with AI review'
        ));
    } catch (error) {
        next(error);
    }
};

exports.getTaskSubmissions = async (req, res, next) => {
    try {
        const submissions = await Submission.find({ task: req.params.taskId })
            .populate('submittedBy', 'name email avatar')
            .sort({ createdAt: -1 });

        res.status(200).json(new ApiResponse(submissions, 'Submissions retrieved'));
    } catch (error) {
        next(error);
    }
};