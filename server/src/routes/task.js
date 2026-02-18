const express = require('express');
const {
    createTask,
    updateTask,               // Added for editing task details
    getProjectTasks,
    updateTaskStatus,
    reviewTaskSubmission,     // Added for Admin Merge/Decline logic
    getMyTasks,
    requestLeave,
    handleLeaveRequest,
    respondToTaskAssignment,
    getTaskById
} = require('../controllers/task.controller.js');
const { protect } = require('../middleware/authMiddleware.js');

const router = express.Router();

// All task routes require authentication
router.use(protect);

// --- General Task Routes ---
router.post('/', createTask);           // Create a new task
router.get('/user/me', getMyTasks);     // Get tasks assigned to logged-in user

// --- Project Specific Routes ---
router.get('/project/:projectId', getProjectTasks); // Get all tasks for a project

// --- Single Task Operations ---
router.get('/:id', getTaskById);        // Fetch full task details
router.put('/:id', updateTask);         // Update task (Owner only: title, desc, etc.)

// --- Workflow & Status Routes ---
router.patch('/:id/status', updateTaskStatus);       // User moves To-Do -> In-Progress
router.patch('/:id/review', reviewTaskSubmission);   // Admin Review: Merge or Decline

// --- Assignment & Leave Routes ---
router.post('/:id/respond', respondToTaskAssignment); // Accept or Decline assignment
router.patch('/:id/leave', requestLeave);            // Request to be unassigned
router.patch('/:id/handle-leave', handleLeaveRequest); // Admin approves/rejects leave

module.exports = router;