const User = require('../models/userModel'); // Changed from '../models/User'
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Secret key for JWT (store securely in .env)
const JWT_SECRET = process.env.JWT_SECRET || 'yourSuperSecretKey';

// Valid roles for users
const validRoles = ['Super_Admin', 'Admin', 'Employee', 'Intern'];

// Signup Controller
const registerUser = async (req, res) => {
    const { name, email, password, role, subRole } = req.body;

    // Check if all fields are provided
    if (!name || !email || !password || !role || !subRole) {
        return res.status(400).json({ msg: 'Please enter all fields' });
    }

    // Validate role if provided
    if (role && !validRoles.includes(role)) {
        return res.status(400).json({ msg: 'Invalid role provided. Allowed roles: Super Admin, Admin, Employee, Intern' });
    }

    try {
        // Check if the user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        // Create new user with default role as 'user' if no role provided
        user = new User({
            name,
            email,
            password,
            role,
            subRole
        });

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        // Generate a 4-digit random ID
        user.userId = Math.floor(1000 + Math.random() * 9000);

        // Save user to DB
        await user.save();

        res.status(201).json({
            msg: 'User registered successfully',
            userId: user.userId,
            email: user.email,
            role: user.role,
            subRole: user.subRole
        });

    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
};

// Get all users
const getUser = async (req, res) => {
    try {
        const users = await User.find();  // Fetch all users
        res.status(200).json(users);
    } catch (err) {
        res.status(500).send('Error retrieving users');
    }
};

// Login Controller
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    // Check if all fields are provided
    if (!email || !password) {
        return res.status(400).json({ msg: 'Please enter all fields' });
    }

    try {
        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid credentials!' });
        }

        // Check if password matches
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid credentials!!' });
        }

        // Generate JWT token with login timestamp
        const loginTime = new Date().toISOString(); // Store login time in ISO format
        const payload = {
            userId: user.userId,
            email: user.email,
            role: user.role,
            subRole: user.subRole,
            loginTime,
        };

        // Create a token without expiration
        const token = jwt.sign(payload, JWT_SECRET);

        // Update last login time in DB
        user.lastLogin = loginTime;
        await user.save();

        res.status(200).json({
            msg: 'Login successful',
            userId: user.userId,
            email: user.email,
            role: user.role,
            subRole: user.subRole,
            token,  // Include token in the response
        });

    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
};

// Function to count logged-in hours
const countLoggedInHours = async (req, res) => {
    try {
        // Extract token from request headers
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ msg: 'Unauthorized, token missing' });
        }

        // Verify and decode the token
        const decoded = jwt.verify(token, JWT_SECRET);
        if (!decoded.loginTime) {
            return res.status(400).json({ msg: 'Login time missing in token' });
        }

        // Get login time from token
        const loginTime = new Date(decoded.loginTime);
        const now = new Date();

        // Calculate the difference
        const diffMs = Math.abs(now - loginTime);
        const diffHrs = Math.floor(diffMs / 36e5);
        const diffMins = Math.floor((diffMs % 36e5) / 60000);
        const diffSecs = Math.floor((diffMs % 60000) / 1000);

        const loggedInHours = `${String(diffHrs).padStart(2, '0')}:${String(diffMins).padStart(2, '0')}:${String(diffSecs).padStart(2, '0')}`;

        res.status(200).json({ loggedInHours });
    } catch (error) {
        console.error("Error counting logged-in hours:", error);
        res.status(500).json({ message: "Server error" });
    }
};

const getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        res.json({ user });
    } catch (error) {
        res.status(500).json({ msg: 'Server error' });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getUser,
    countLoggedInHours,
    getCurrentUser
};
