const express = require('express');
const notificationsController = require('../controllers/NotificationsController');
const authenticateToken = require('../middleware/authenticateToken'); // Middleware for authentication

const router = express.Router();

// List all notifications for a specific student
router.get('/notifications/:studentId', authenticateToken, notificationsController.index);

// Send a notification to a student
router.post('/notifications', authenticateToken, notificationsController.create);

// Delete a specific notification
router.delete('/notifications/:id', authenticateToken, notificationsController.destroy);

module.exports = router;
