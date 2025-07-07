const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const authenticateToken = require('./middleware/authMiddleware');

// Load environment variables
dotenv.config();

const app = express();

// CORS configuration
app.use(cors({
  origin: 'http://localhost:5173', // Your frontend URL
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware to parse incoming JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  if (req.method === 'POST' || req.method === 'PUT') {
    console.log('Request body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

// Import your routes
const studentRoutes = require('./routes/studentRoutes');
const schoolsRoutes = require('./routes/schoolsRoutes');
const teachersRoutes = require('./routes/teachersRoutes');
const subjectsRoutes = require('./routes/subjectsRoutes');
const classesRoutes = require('./routes/classesRoutes');
const scoresRoutes = require('./routes/scoresRoutes');
const notificationsRoutes = require('./routes/notificationsRoutes');
const adminRoutes = require('./routes/adminRoutes');
const authRoutes = require('./routes/authRoutes');
const resultCheckerRoutes = require('./routes/resultCheckerRoutes');

// Use your routes
app.use('/api/students', studentRoutes);
app.use('/api/schools', schoolsRoutes);
app.use('/api/teachers', teachersRoutes);
app.use('/api/classes', authenticateToken, classesRoutes);
app.use('/api/subjects', authenticateToken, subjectsRoutes);
app.use('/api/scores', authenticateToken, scoresRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/auth', authRoutes);
app.use('/api/result-checker', resultCheckerRoutes);

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to SmartScore Backend', status: 'OK' });
});

// Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    success: false, 
    error: 'Internal server error' 
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    error: `Route ${req.method} ${req.originalUrl} not found` 
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Test auth: http://localhost:${PORT}/auth/test`);
});