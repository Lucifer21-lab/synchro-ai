const express = require('express');
const {
    submitWork,
    mergeWork,
    getTaskSubmissions
} = require('../controllers/submissions.controller.js');
const { protect } = require('../middleware/authMiddleware.js');
const { isProjectOwner } = require('../middleware/roleMiddleware.js');
const upload = require('../middleware/multerMiddleware.js');

const router = express.Router();

router.use(protect);

router.post('/', upload.single('file'), submitWork);
router.get('/task/:taskId', getTaskSubmissions);

// Final gate: Only owner can merge work
router.post('/:id/merge', isProjectOwner, mergeWork);

module.exports = router;