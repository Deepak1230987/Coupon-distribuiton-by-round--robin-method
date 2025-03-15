const router = require('express').Router();
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

// Admin Signup
router.post('/signup', async (req, res) => {
    try {
        const { username, password, email } = req.body;

        // Validate input
        if (!username || !password || !email) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Check if username already exists
        const existingUsername = await Admin.findOne({ username });
        if (existingUsername) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        // Check if email already exists
        const existingEmail = await Admin.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        // Create new admin
        const admin = new Admin({
            username,
            password,
            email
        });

        await admin.save();

        // Generate JWT token
        const token = jwt.sign(
            { id: admin._id },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'None',
            maxAge: 24 * 60 * 60 * 1000, // 1 day
            path: '/'
        });

        res.status(201).json({ message: 'Admin created successfully' });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Admin Login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Find admin by username
        const admin = await Admin.findOne({ username });
        if (!admin) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await admin.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: admin._id },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'None',
            maxAge: 24 * 60 * 60 * 1000, // 1 day
            path: '/'
        });

        res.json({ message: 'Login successful' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Admin Logout
router.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Logged out successfully' });
});

module.exports = router; 
