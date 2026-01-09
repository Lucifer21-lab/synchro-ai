import express from 'express';
import {
    createTask,
    getProjectTasks,
    updateTaskStatus
} from '../controllers/taskController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/', createTask);
router.get('/project/:projectId', getProjectTasks);
router.patch('/:id/status', updateTaskStatus);

export default router;