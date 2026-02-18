const express = require('express');
const {
    register,
    login,
    verifyOtp,
    getMe,
    forgotPassword,
    resetPassword,
    updateDetails
} = require('../controllers/auth.controller');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', register);
router.post('/verify-otp', verifyOtp);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:resettoken', resetPassword);
router.get('/me', protect, getMe);
router.put('/updatedetails', protect, updateDetails);

module.exports = router;