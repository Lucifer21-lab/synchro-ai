const express = require('express');
const {
    createProject,
    getProjects,
    getProjectById,
    inviteMember,
    deleteProject,
    updateProject
} = require('../controllers/projects.controller');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
    .get(protect, getProjects)
    .post(protect, createProject);

router.route('/:id')
    .get(protect, getProjectById)
    .put(protect, updateProject)
    .delete(protect, deleteProject);

router.post('/:id/invite', protect, inviteMember);

module.exports = router;