const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    action: {
        type: String,            // e.g., "John merged 'Navbar Component'"
        required: true
    },
}, { timestamps: true });

module.exports = mongoose.model('Activity', activitySchema);