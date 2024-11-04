const prisma = require('../../prisma/prismaClient'); // Adjust the path as necessary

// List all notifications for a student
async function index(req, res) {
  try {
    const { studentId } = req.params;

    if (!studentId) {
      return res.status(400).json({ message: 'Student ID is required' });
    }

    const notifications = await prisma.notification.findMany({
      where: { student_id: parseInt(studentId, 10) },
      orderBy: { sent_at: 'desc' }, // Order by sent date, most recent first
    });

    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notifications', error: error.message });
  }
}

// Send a notification to a student
async function create(req, res) {
  try {
    const { student_id, message } = req.body;

    if (!student_id || !message) {
      return res.status(400).json({ message: 'Student ID and message are required' });
    }

    const newNotification = await prisma.notification.create({
      data: {
        student_id: parseInt(student_id, 10),
        message,
        sent_at: new Date(), // Set the sent_at timestamp to the current time
      },
    });

    res.status(201).json({ message: 'Notification sent successfully', notification: newNotification });
  } catch (error) {
    res.status(500).json({ message: 'Error sending notification', error: error.message });
  }
}

// Delete a specific notification
async function destroy(req, res) {
  try {
    const { id } = req.params;

    const deletedNotification = await prisma.notification.delete({
      where: { id: parseInt(id, 10) },
    });

    res.status(200).json({ message: 'Notification deleted successfully', notification: deletedNotification });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting notification', error: error.message });
  }
}

module.exports = {
  index,
  create,
  destroy,
};
