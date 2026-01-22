const User = require('../models/User');
const { verifyToken } = require('../utils/jwt');
const { ApiError } = require('../utils/apiResponse');

/**
 * Middleware to protect routes and verify JWT tokens
 */
exports.protect = async (req, res, next) => {
    try {
        let token;

        // Check if token exists in Authorization header
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return next(new ApiError('You are not logged in. Please login to get access.', 401));
        }

        // Verify the token
        const decoded = verifyToken(token);

        // FIX: Chain .select('-password') HERE (on the query), not on the result.
        // This ensures we get the user WITHOUT the password hash.
        const currentUser = await User.findById(decoded.id).select('-password');

        if (!currentUser) {
            return next(new ApiError('The user belonging to this token no longer exists.', 401));
        }

        // GRANT ACCESS TO PROTECTED ROUTE
        req.user = currentUser;
        next();

    } catch (error) {
        // Handle invalid or expired tokens
        if (error.name === 'JsonWebTokenError') {
            return next(new ApiError('Invalid token. Please log in again!', 401));
        }
        if (error.name === 'TokenExpiredError') {
            return next(new ApiError('Your token has expired! Please log in again.', 401));
        }
        next(error);
    }
};