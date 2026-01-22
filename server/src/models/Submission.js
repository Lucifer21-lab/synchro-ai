const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
    task: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task',
        required: true
    },
    submittedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    contentUrl: {
        type: String               // Link to file/code/document
    },
    comment: {
        type: String               // Contributor's note to owner
    },
    aiReview: {
        feedback: String,          // Detailed AI comments
        score: Number,             // Suggested quality score
        passedAI: Boolean          // Automated pass/fail based on project rules
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
    }
}, { timestamps: true });

module.exports = mongoose.model('Submission', submissionSchema);