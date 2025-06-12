const express = require('express');
const ResultCheckerService = require('../services/ResultCheckerService');
const router = express.Router();

// Generate result checker token
router.post('/generate-token', async (req, res) => {
  try {
    const { studentId, classId } = req.body;
    
    if (!studentId || !classId) {
      return res.status(400).json({ message: 'Student ID and Class ID are required' });
    }

    const tokenData = await ResultCheckerService.generateResultToken(studentId, classId);
    res.status(200).json(tokenData);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Check results with token
router.post('/check-results', async (req, res) => {
  try {
    const { studentId, classId, token } = req.body;
    
    if (!studentId || !classId || !token) {
      return res.status(400).json({ message: 'Student ID, Class ID, and token are required' });
    }

    const results = await ResultCheckerService.getStudentResults(studentId, classId, token);
    res.status(200).json(results);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Reset token trials (admin only)
router.post('/reset-trials', async (req, res) => {
  try {
    const { studentId, classId } = req.body;
    
    const success = await ResultCheckerService.resetTokenTrials(studentId, classId);
    
    if (success) {
      res.status(200).json({ message: 'Token trials reset successfully' });
    } else {
      res.status(404).json({ message: 'Token not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;