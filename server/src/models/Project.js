const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Project title is required'],
        trim: true,
        maxlength: [100, 'Title cannot exceed 100 characters']
    },
    description: {
        type: String,
        trim: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Project must have an owner']
    },
    members: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        role: {
            type: String,
            enum: ['Owner', 'Contributor', 'Viewer'],
            default: 'Contributor'
        }
    }],
    // SECURE STORAGE: For your encryption.js utility output
    aiApiKey: {
        iv: { type: String },
        content: { type: String },
        select: false
    },
    aiSummary: {
        type: String,
        default: 'Waiting for first task submission to generate summary...'
    },
    isArchived: {
        type: Boolean,
        default: false
    },
    // Useful for monitoring project health in the dashboard
    status: {
        type: String,
        enum: ['Planning', 'Active', 'Completed'],
        default: 'Planning'
    }
}, {
    timestamps: true,
    // These allow virtual fields (like tasks) to show up in JSON responses
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// VIRTUAL: Automatically link tasks to the project without storing an array of IDs
projectSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'project'
});

module.exports = mongoose.model('Project', projectSchema);