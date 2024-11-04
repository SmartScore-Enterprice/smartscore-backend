const express = require('express');
const { index, create, average } = require('../controllers/ScoresController'); // Ensure the correct path
const authenticateToken = require('../middleware/authenticateToken'); // Import directly without destructuring

const router = express.Router();

// Routes for scores
router.get('/:student_id', authenticateToken, index); // List all scores for a student
router.post('/', authenticateToken, create); // Add or update a student's score
router.get('/average/:student_id', authenticateToken, average); // Calculate average score for a student

module.exports = router;
