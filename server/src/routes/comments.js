const express = require('express');
const { addComment, getTaskComments } = require('../controllers/comments.controller.js');
const { protect } = require('../middleware/authMiddleware.js');

const router = express.Router();

router.use(protect);

router.post('/', addComment);
router.get('/task/:taskId', getTaskComments);

module.exports = router;