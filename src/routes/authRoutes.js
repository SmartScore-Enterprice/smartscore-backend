const express = require('express');
const { registerAdmin, loginAdmin, getCurrentUser, logoutUser, refreshToken } = require('../controllers/adminController');
const authenticateToken = require('../middleware/authMiddleware');

const router = express.Router();

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Auth routes are working!' });
});

// Public routes
router.post('/register', registerAdmin); // Public route for user registration
router.post('/login', loginAdmin); // Public route for user login
router.post('/refresh', refreshToken); // Refresh access token

// Protected routes
router.get('/me', authenticateToken, getCurrentUser); // Get current user data
router.post('/logout', authenticateToken, logoutUser); // Logout user
router.get('/profile', authenticateToken, (req, res) => {
  res.json({ message: 'Profile accessed successfully', user: req.user });
});

module.exports = router;
