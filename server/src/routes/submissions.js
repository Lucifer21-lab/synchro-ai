import express from 'express';
import {
    submitWork,
    mergeWork,
    getTaskSubmissions
} from '../controllers/submissionController.js';
import { protect } from '../middleware/authMiddleware.js';
import { isProjectOwner } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/', submitWork);
router.get('/task/:taskId', getTaskSubmissions);

// Final gate: Only owner can merge work
router.post('/:id/merge', isProjectOwner, mergeWork);

export default router;