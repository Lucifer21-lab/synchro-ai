const express = require('express');
const { getProjectActivities } = require('../controllers/activities.controller.js');
const { getUserActivities } = require('../controllers/activities.controller.js');
const { protect } = require('../middleware/authMiddleware.js');

const router = express.Router();

router.use(protect);

router.get('/project/:projectId', getProjectActivities);
router.get('/user/me', getUserActivities);

module.exports = router;