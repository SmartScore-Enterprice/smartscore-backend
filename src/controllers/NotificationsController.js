const prisma = require('../../prisma/prismaClient');
const NotificationService = require('../services/NotificationService');

// List all notifications for a specific student
async function index(req, res) {
  try {
    const { studentId } = req.params;

    if (!studentId) {
      return res.status(400).json({ message: 'Student ID is required' });
    }

    const notifications = await prisma.notification.findMany({
      where: { studentId: parseInt(studentId, 10) },
      orderBy: { sentAt: 'desc' },
    });

    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notifications', error: error.message });
  }
}

// Send a notification to a student
async function create(req, res) {
  try {
    const { studentId, message, options = {} } = req.body;

    if (!studentId || !message) {
      return res.status(400).json({ message: 'Student ID and message are required' });
    }

    const notification = await NotificationService.sendCustomNotification(
      parseInt(studentId, 10), 
      message, 
      options
    );

    res.status(201).json({ 
      message: 'Notification sent successfully', 
      notification 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error sending notification', error: error.message });
  }
}

// Send bulk notifications
async function sendBulk(req, res) {
  try {
    const { studentIds, message, options = {} } = req.body;

    if (!studentIds || !Array.isArray(studentIds) || !message) {
      return res.status(400).json({ message: 'Student IDs array and message are required' });
    }

    const results = await NotificationService.sendBulkNotification(studentIds, message, options);

    res.status(200).json({
      message: 'Bulk notifications processed',
      results
    });
  } catch (error) {
    res.status(500).json({ message: 'Error sending bulk notifications', error: error.message });
  }
}

// Get notification statistics
async function getStats(req, res) {
  try {
    const { schoolId } = req.params;
    const { dateRange = 30 } = req.query;

    if (!schoolId) {
      return res.status(400).json({ message: 'School ID is required' });
    }

    const stats = await NotificationService.getNotificationStats(
      parseInt(schoolId, 10), 
      parseInt(dateRange, 10)
    );

    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Error getting notification statistics', error: error.message });
  }
}

// Delete a specific notification
async function destroy(req, res) {
  try {
    const { id } = req.params;

    const deletedNotification = await prisma.notification.delete({
      where: { id: parseInt(id, 10) },
    });

    res.status(200).json({ 
      message: 'Notification deleted successfully', 
      notification: deletedNotification 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting notification', error: error.message });
  }
}

module.exports = {
  index,
  create,
  sendBulk,
  getStats,
  destroy,
};
