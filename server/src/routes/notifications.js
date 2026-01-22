const express = require('express');
const {
    getNotifications,
    markAsRead,
    getActivityLogs,
    markAllAsRead
} = require('../controllers/notifications.controller.js');
const { protect } = require('../middleware/authMiddleware.js');

const router = express.Router();

router.use(protect);

router.get('/', getNotifications);
router.patch('/:id/read', markAsRead);
router.patch('/read-all', markAllAsRead);
router.get('/activity/:projectId', getActivityLogs); // The monitoring timeline

module.exports = router;