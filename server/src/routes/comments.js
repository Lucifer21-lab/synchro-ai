import express from 'express';
import { addComment, getTaskComments } from '../controllers/commentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/', addComment);
router.get('/task/:taskId', getTaskComments);

export default router;