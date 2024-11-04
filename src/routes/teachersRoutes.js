// src/routes/teachersRoutes.js

const express = require('express');
const TeachersController = require('../controllers/TeachersController');
const isAdmin = require('../middleware/isAdmin');

const router = express.Router();

// Teacher signup and login routes
router.post('/signup', TeachersController.signup);
router.post('/login', TeachersController.login);

// CRUD Operations for teachers
router.get('/', TeachersController.index); // Get all teachers
router.get('/:id', TeachersController.show); // Get a single teacher by ID
router.post('/', isAdmin, TeachersController.create); // Admin action to create a new teacher
router.put('/:id', TeachersController.update); // Update teacher details
router.delete('/:id', isAdmin, TeachersController.destroy); // Admin action to delete a teacher

module.exports = router;
