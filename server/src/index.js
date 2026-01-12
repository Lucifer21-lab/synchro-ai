// import all the necessary modules
const express = require('express');
const rateLimiter = require('express-rate-limit');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket-io');
require('dotenv').config();

// Import middlewares and services
const { errorHandler } = require('./middleware/errorMiddleware');
const notificationService = require('./services/notificationService');
const connectDB = require('./config/db');
const socketConfig = require('./config/socket');

// import all routes 
const activityRoutes = require('./routes/activities');
const commentsRoutes = require('./routes/comments');
const notificationRoutes = require('./routes/notifications');
const projectsRoutes = require('./routes/projects');
const submissionRoutes = require('./routes/submissions');
const taskRoutes = require('./routes/task');
const authRoutes = require('./routes/auth');

// initialise express app
const app = express();
const server = http.createServer(app);

// socket config
const io = new Server(server, socketConfig);

// connect notification service to the socket instance
notificationService.init(io);

// connect to the database
connectDB();

// setup middleware
app.use(cors());
app.use(express.json({ limit: '2mb' })); // body parser for json
app.use(express.urlencoded({ extended: true, limit: '2mb' })); // body parser for url encoded data
app.use('/uploads', express.static('uploads')); // serve static files

// Security: Rate Limiting
const limiter = rateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: "Too many requests from this IP, please try again later"
});

app.use('/api/', limiter);

// create all the routes
app.use('/api/auth', authRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/comments', commentsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/task', taskRoutes);
app.use('/api/submissions', submissionRoutes);

// socket.io connection logic
io.on('connection', (socket) => {
    socket.on('join', (userId) => {
        socket.join(userId);
        console.log(`User ${userId} jooined their notification room`);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected from socket');
    });
});

// health check
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timeStamp: new Date()
    });
});

// 404 handler for non-existent routes
app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Final Global Error Handler (Must be the last middleware)
app.use(errorHandler);

// start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('UNHANDLED REJECTION! Shutting Down....');
    console.error(err.name, err.message);
    server.close(() => {
        console.log('Exiting the server');
        process.exit(1);
    });
});

module.exports = app;