import express from 'express';
import {
    createProject,
    getProjects,
    getProjectById,
    inviteMember
} from '../controllers/projectController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // Protect all routes in this file

router.post('/', createProject);
router.get('/', getProjects);
router.get('/:id', getProjectById);
router.post('/:id/invite', inviteMember);

export default router;