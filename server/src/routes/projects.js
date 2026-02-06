const express = require('express');
const {
    createProject,
    getProjects,
    getProjectById,
    inviteMember,
    acceptInvite,
    rejectInvite,
    removeMember,
    deleteProject
} = require('../controllers/projects.controller.js');
const { protect } = require('../middleware/authMiddleware.js');

const router = express.Router();

router.use(protect); // Protect all routes in this file

router.post('/', createProject);
router.get('/', getProjects);
router.delete('/:projectId/members/:memberId', protect, removeMember);
router.get('/:id', getProjectById);
router.post('/:id/invite', inviteMember);
router.patch('/:id/accept', acceptInvite);
router.delete('/:id/leave', rejectInvite);
router.delete('/:id', deleteProject);

module.exports = router;