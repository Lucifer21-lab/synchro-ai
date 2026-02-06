const express = require('express');
const {
    createTask,
    getProjectTasks,
    updateTaskStatus,
    getMyTasks,
    requestLeave,
    handleLeaveRequest,
    respondToTaskAssignment
} = require('../controllers/task.controller.js'); // Corrected filename to singular 'task'
const { protect } = require('../middleware/authMiddleware.js');

const router = express.Router();

router.use(protect);

router.post('/', createTask);
router.get('/user/me', getMyTasks);
router.get('/project/:projectId', getProjectTasks);
router.patch('/:id/status', updateTaskStatus);
router.patch('/:id/leave', requestLeave);
router.patch('/:id/handle-leave', handleLeaveRequest);
router.post('/:id/respond', respondToTaskAssignment);

module.exports = router;