import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    status: {
        type: String,
        enum: ['To-Do', 'In-Progress', 'Review-Requested', 'Merged'],
        default: 'To-Do'
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High'],
        default: 'Medium'
    },
    deadline: {
        type: Date
    },
    mergedBy: {
        type: mongoose.Schema.Types.ObjectId,                 // Records who finalized the work
        ref: 'User'
    }
}, { timestamps: true });

export default mongoose.model('Task', taskSchema);