import express from 'express';
import {
    submitWork,
    mergeWork,
    getTaskSubmissions
} from '../controllers/submissionController.js';
import { protect } from '../middleware/authMiddleware.js';
import { isProjectOwner } from '../middleware/roleMiddleware.js';
const upload = require('../middleware/multerMiddleware.js');

const router = express.Router();

router.use(protect);

router.post('/', upload.single('file'), submitWork);
router.get('/task/:taskId', getTaskSubmissions);

// Final gate: Only owner can merge work
router.post('/:id/merge', isProjectOwner, mergeWork);

export default router;