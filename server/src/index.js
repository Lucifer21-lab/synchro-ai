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

// Initialize Services (if they have side effects/listeners)
require('./services/notificationServices');

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
        methods: ["GET", "POST", "PATCH", "DELETE"],
        credentials: true
    }
});

// 2. Middleware
// CRITICAL FIX: CORS must match the client URL and allow credentials
app.use(cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true
}));
app.use(express.json());

// 3. Make io accessible in routes via req.io
app.use((req, res, next) => {
    req.io = io;
    next();
});

// 4. Socket.io Connection Logic
io.on('connection', (socket) => {
    console.log(`User Connected: ${socket.id}`);

    // Join Project Room
    socket.on('join_project', (projectId) => {
        socket.join(projectId);
        console.log(`User ${socket.id} joined project: ${projectId}`);
    });

    socket.on('disconnect', () => {
        console.log("User Disconnected", socket.id);
    });
});

// 5. Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/task', taskRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/comments', commentRoutes);

// 6. Error Handling Middleware
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