const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const authenticateToken = require('./middleware/authMiddleware');

// Load environment variables
dotenv.config();

const app = express();
app.use(cors({
  origin: 'http://localhost:5173' // Replace with your frontend URL
}));

// Middleware to parse incoming JSON
app.use(express.json());

// Import your routes
const studentRoutes = require('./routes/studentRoutes');
const schoolsRoutes = require('./routes/schoolsRoutes');
const teachersRoutes = require('./routes/teachersRoutes');
const subjectsRoutes = require('./routes/subjectsRoutes');
const classesRoutes = require('./routes/classesRoutes');
const scoresRoutes = require('./routes/scoresRoutes');
const notificationsRoutes = require('./routes/notificationsRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Use your routes
app.use('/api/students', studentRoutes);
app.use('/api/schools', schoolsRoutes);
app.use('/api/teachers', teachersRoutes);
app.use('/api/classes', authenticateToken, classesRoutes);
app.use('/api/subjects', authenticateToken, subjectsRoutes);
app.use('/api/scores', authenticateToken, scoresRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/admin', adminRoutes);

// Test route
app.get('/', (req, res) => {
  res.send('Welcome to SmartScore Backend');
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
