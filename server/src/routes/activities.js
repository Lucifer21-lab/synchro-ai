import express from 'express';
import {
    getProjectActivities,
    getUserActivities
} from '../controllers/activityController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/project/:projectId', getProjectActivities);
router.get('/user/me', getUserActivities);

export default router;