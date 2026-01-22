const express = require('express');
const {
    createProject,
    getProjects,
    getProjectById,
    inviteMember
} = require('../controllers/projects.controller.js');
const { protect } = require('../middleware/authMiddleware.js');

const router = express.Router();

router.use(protect); // Protect all routes in this file

router.post('/', createProject);
router.get('/', getProjects);
router.get('/:id', getProjectById);
router.post('/:id/invite', inviteMember);

module.exports = router;