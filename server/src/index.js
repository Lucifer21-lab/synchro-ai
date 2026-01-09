// import all the necessary modules
const express = require('express');
const rateLimiter = require('express-rate-limit');
const http = require('http');
const cors = require('cors');
require('dotenv').config();

// imprt all middlewares
const errorHandler = require('./middleware/errorMiddleware');

// import all config files
const connectDB = require('./config/db');

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

// connect the config files
connectDB();

// setup middleware
app.use(cors());
app.use(express.json({ limit: '2mb' })); // body parser for json
app.use(express.urlencoded({ extended: true, limit: '2mb' })); // body parser for url encoded data
app.use('/uploads', express.static('uploads')); // serve static files

const limiter = rateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: "Too many request from this IP, please try again later"
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

// health check and final error handler
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timeStamp: new Date()
    });
});

app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

app.use(errorHandler)

// start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});

process.on('unhandledRejection', (err) => {
    console.error('UNHANDLED REJECTION! Shutting Down....');
    console.error(err.name, err.message);
    server.close(() => {
        console.log('Exiting the server');
        process.exit(1);
    })
})

module.exports = app;