const express = require('express');
const notificationsController = require('../controllers/NotificationsController');
const authenticateToken = require('../middleware/authenticateToken');
const isAdmin = require('../middleware/isAdmin');

const router = express.Router();

// List all notifications for a specific student
router.get('/:studentId', authenticateToken, notificationsController.index);

// Send a notification to a student
router.post('/', authenticateToken, notificationsController.create);

// Send bulk notifications (admin only)
router.post('/bulk', authenticateToken, isAdmin, notificationsController.sendBulk);

// Get notification statistics (admin only)
router.get('/stats/:schoolId', authenticateToken, isAdmin, notificationsController.getStats);

// Delete a specific notification
router.delete('/:id', authenticateToken, notificationsController.destroy);

module.exports = router;
