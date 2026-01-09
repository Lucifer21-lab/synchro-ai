const User = require('../models/User');
const { generateToken } = require('../utils/jwt');
const { ApiResponse, ApiError } = require('../utils/apiResponse');
const { hashPassword, compareHash } = require('../utils/encryption');

// Register a user
exports.register = async (req, res, next) => {
    try {
        const { name, email, password, skills } = req.body;

        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return next(new ApiError('User already exists with this email', 400));
        }

        // Hash the password before saving
        const hashedPassword = await hashPassword(password);

        // Create the user
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            skills: skills || []
        });

        if (user) {
            // Send successful response with token
            const token = generateToken(user._id);
            res.status(201).json(new ApiResponse(
                {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    token
                },
                'User registered successfully',
                201
            ));
        }
    } catch (error) {
        next(error);
    }
};

// authenticate user and get token for login
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const user = await User.findOne({ email });

        // Check if user exists and password matches
        if (user && (await compareHash(password, user.password))) {
            const token = generateToken(user._id);

            res.status(200).json(new ApiResponse(
                {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    token
                },
                'Login successful'
            ));
        } else {
            return next(new ApiError('Invalid email or password', 401));
        }
    } catch (error) {
        next(error);
    }
};

// get current user profile
exports.getMe = async (req, res, next) => {
    try {
        // req.user is already populated by your protect middleware
        const user = await User.findById(req.user.id).select('-password');

        res.status(200).json(new ApiResponse(
            user,
            'User profile retrieved successfully'
        ));
    } catch (error) {
        next(error);
    }
};