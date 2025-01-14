const express = require('express');
const { index, create, update, show, destroy } = require('../controllers/SubjectsController');
const isAdmin = require('../middleware/isAdmin'); // Ensure this middleware checks for admin access

const router = express.Router();

// Routes for subjects
router.get('/', index); // List all subjects
router.post('/', isAdmin, create); // Create a new subject (admin only)
router.put('/:id', isAdmin, update); // Update a specific subject (admin only)
router.get('/:id', show); // Show details of a specific subject
router.delete('/:id', isAdmin, destroy); // Delete a specific subject (admin only)

module.exports = router;
