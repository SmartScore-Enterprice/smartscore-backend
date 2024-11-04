const express = require('express');
const router = express.Router();
const StudentsController = require('../controllers/StudentsController');
const isAdmin = require('../middleware/isAdmin');


// Student signup and login routes
router.post('/signup', StudentsController.signup);
router.post('/login', StudentsController.login);

// CRUD Operations
router.get('/', StudentsController.index); // Get all students
router.get('/:id', StudentsController.show); // Get a single student by ID
router.post('/', StudentsController.create); // Create a new student (Admin action)
router.put('/:id', StudentsController.update); // Update a student's details
router.delete('/:id', StudentsController.destroy); // Delete a student

module.exports = router;