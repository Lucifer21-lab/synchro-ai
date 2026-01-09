import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {                 // Hashed
        type: String,
        required: true
    },
    avatar: {
        type: String,
        default: 'https://api.dicebear.com/7.x/avataaars/svg'
    },
    skills: [String],            // Array of strings for AI matching
    role: {
        type: String,
        enum: ['Admin', 'User'],
        default: 'User'
    }
}, { timestamps: true });

export default mongoose.model('User', userSchema);