import express from 'express';
import {
    getNotifications,
    markAsRead,
    getActivityLogs,
    markAllAsRead
} from '../controllers/notificationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getNotifications);
router.patch('/:id/read', markAsRead);
router.patch('/read-all', markAllAsRead);
router.get('/activity/:projectId', getActivityLogs); // The monitoring timeline

export default router;