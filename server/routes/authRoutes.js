// server/routes/authRoutes.js

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // <--- CHECK THIS LINE CAREFULLY
const { protect } = require('../middleware/authMiddleware');

// ... (rest of your code, which is fine)

// @route POST /api/auth/register
// @desc Register user
// @access Public
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // Check if user exists
        let user = await User.findOne({ email });
        if (user) {
            // Changed message for clarity
            return res.status(400).json({ message: 'User already exists with this email.' });
        }

        // Create new user instance
        // Password hashing will now be handled by the pre('save') hook in User.js
        user = new User({ username, email, password });

        await user.save(); // This will trigger the pre('save') hook and hash the password

        // Generate JWT token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: '1h'
        });

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });

    } catch (error) {
        console.error('Registration Error:', error); // Log the full error object for debugging

        // More specific error handling for common Mongoose errors
        if (error.code === 11000) { // Duplicate key error (for unique fields like email, username)
            return res.status(400).json({ message: 'This email or username is already registered.' });
        }
        if (error.name === 'ValidationError') { // Mongoose validation errors
            const errors = {};
            Object.keys(error.errors).forEach((key) => {
                errors[key] = error.errors[key].message;
            });
            return res.status(400).json({ message: 'Validation failed', errors });
        }

        res.status(500).json({ message: 'Server error: Could not register user.' });
    }
});

// @route POST /api/auth/login
// @desc Authenticate user & get token
// @access Public
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if user exists
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: '1h'
        });

        res.status(200).json({
            message: 'Logged in successfully',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });

    } catch (error) {
        console.error('Login Error:', error); // Log the full error object for debugging
        res.status(500).json({ message: 'Server error: Could not log in user.' });
    }
});

// @route GET /api/auth/me
// @desc Get current user's data (protected route)
// @access Private
router.get('/me', protect, async (req, res) => {
    try {
        const user = req.user; // User object attached by protect middleware
        if (!user) {
            // This case might happen if token is valid but user somehow deleted from DB
            return res.status(404).json({ message: 'Authenticated user not found in database.' });
        }
        res.status(200).json({ user });
    } catch (error) {
        console.error('Get User Data Error:', error); // Log the full error object for debugging
        res.status(500).json({ message: 'Server error: Could not retrieve user data.' });
    }
});

// @route GET /api/auth/me
// @desc Get current user's data (protected route)
// @access Private
router.get('/me', protect, async (req, res) => {
    try {
        const user = req.user; // User object attached by protect middleware
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;