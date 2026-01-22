const express = require('express');
const {
    register,
    login,
    verifyOtp,
    getMe,
    forgotPassword, // Import this
    resetPassword   // Import this
} = require('../controllers/auth.controller');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', register);
router.post('/verify-otp', verifyOtp);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);        // New Route
router.put('/reset-password/:resettoken', resetPassword); // New Route
router.get('/me', protect, getMe);

module.exports = router;