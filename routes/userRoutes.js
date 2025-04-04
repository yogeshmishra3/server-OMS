const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUser, countLoggedInHours } = require('../controllers/userController');
const User = require("../models/userModel"); // Mongoose User model
// const authenticate = require("../middlewares/authMiddleware"); // Authentication middleware
const authMiddleware = require('../middlewares/authMiddleware');

// POST /signup - Register a new user
router.post('/signup', registerUser);

router.get('/', getUser);

// POST /login - Login user
router.post('/login', loginUser);

// ✅ Get Logged-in User Data
router.get("/me", authMiddleware.authenticate, async (req, res) => {
    try {
        // Find user using `userId` stored in JWT token
        const user = await User.findOne({ userId: req.user.userId }).select("-password"); // Exclude password

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json(user); // Send full user data
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// ✅ Get All Users (If Needed)
router.get("/users", async (req, res) => {
    try {
        const users = await User.find().select("-password");
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

// GET /logged-in-hours - Count logged-in hours
router.get('/logged-in-hours', authMiddleware.authenticate, countLoggedInHours);

module.exports = router;
