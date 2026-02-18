const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');

// Import Routes
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const taskRoutes = require('./routes/task');
const submissionRoutes = require('./routes/submissions');
const activityRoutes = require('./routes/activities');
const notificationRoutes = require('./routes/notifications');
const commentRoutes = require('./routes/comments');

// Import Service (Capture the instance to init later)
const notificationService = require('./services/notificationServices'); // <--- UPDATED

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();
const server = http.createServer(app);

// --- CONFIGURATION ---
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

// 1. Socket.io Setup
const io = new Server(server, {
    cors: {
        origin: CLIENT_URL,
        methods: ["GET", "POST", "PATCH", "DELETE", "PUT"], // Added PUT just in case
        credentials: true
    }
});

// 2. Initialize Services with Socket.io
// CRITICAL: This connects the notification service to the live socket
notificationService.init(io); // <--- ADD THIS LINE

// 3. Middleware
app.use(cors({
    origin: CLIENT_URL,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true
}));
app.use(express.json());

// 4. Make io accessible in routes via req.io (Optional, if you use req.io in controllers)
app.use((req, res, next) => {
    req.io = io;
    next();
});

// 5. Socket.io Connection Logic
io.on('connection', (socket) => {
    console.log(`User Connected: ${socket.id}`);

    // Join Project Room
    socket.on('join_project', (projectId) => {
        socket.join(projectId);
        console.log(`User ${socket.id} joined project: ${projectId}`);
    });

    // Join User Room (For private notifications)
    // The frontend should emit this or we rely on the user ID being the room name
    socket.on('join_user_room', (userId) => {
        socket.join(userId);
        console.log(`User ${socket.id} joined private room: ${userId}`);
    });

    socket.on('disconnect', () => {
        console.log("User Disconnected", socket.id);
    });
});

// 6. Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/task', taskRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/comments', commentRoutes);

// 7. Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Server Error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Socket.io running on port ${PORT}`);
});