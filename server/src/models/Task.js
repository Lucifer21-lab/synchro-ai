const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: { type: String },

    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },

    // The person who created the task (The Owner)
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    // The person assigned to do the work
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },

    // NEW FIELDS FOR WORKFLOW
    assignmentStatus: {
        type: String,
        enum: ['Pending', 'Active', 'None'],
        default: 'None'
    },

    leaveRequested: {
        type: Boolean,
        default: false
    },

    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High'],
        default: 'Medium'
    },
    status: {
        type: String,
        enum: ['To-Do', 'In-Progress', 'Submitted', 'Merged'],
        default: 'To-Do'
    },
    deadline: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);