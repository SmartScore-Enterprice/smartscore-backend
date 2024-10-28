const express = require('express');
const { registerAdmin, loginAdmin } = require('../controllers/adminController');
const authenticateToken = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', registerAdmin); // Public route for admin registration
router.post('/login', loginAdmin); // Public route for admin login
router.get('/dashboard', authenticateToken, (req, res) => {
  res.json({ message: 'Welcome to the admin dashboard!' });
});

module.exports = router;
