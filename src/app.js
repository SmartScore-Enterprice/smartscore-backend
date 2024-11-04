// src/app.js

const express = require('express');
const dotenv = require('dotenv');
const authenticateToken = require('./middleware/authMiddleware'); // Adjust the path if necessary

// Import your routes
const studentRoutes = require('./routes/studentRoutes');
const schoolsRoutes = require('./routes/schoolsRoutes');
const teachersRoutes = require('./routes/teachersRoutes');
const subjectsRoutes = require('./routes/subjectsRoutes');
const classesRoutes = require('./routes/classesRoutes');
const scoresRoutes = require('./routes/scoresRoutes');
const notificationsRoutes = require('./routes/notificationsRoutes');
const adminRoutes = require('./routes/adminRoutes'); // Import admin routes

// Load environment variables
dotenv.config();

const app = express();

// Middleware to parse incoming JSON
app.use(express.json());

// Use your routes
app.use('/api/students', studentRoutes);
app.use('/api/schools', schoolsRoutes);
app.use('/api/teachers', teachersRoutes);
app.use('/api/classes', authenticateToken, classesRoutes); // Route for classes
app.use('/api/subjects', authenticateToken, subjectsRoutes);
app.use('/api/scores', authenticateToken, scoresRoutes);
app.use('/api/notifications', notificationsRoutes); // Make sure notificationsRoutes are under /api/notifications
app.use('/api/admin', adminRoutes); // Use admin routes under /api/admin

// Test route
app.get('/', (req, res) => {
  res.send('Welcome to SmartScore Backend');
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
