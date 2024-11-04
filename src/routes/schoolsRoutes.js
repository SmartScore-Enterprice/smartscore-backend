const express = require('express');
const router = express.Router();
const SchoolsController = require('../controllers/SchoolsController');
const isAdmin = require('../middleware/isAdmin');


// List all schools
router.get('/', SchoolsController.index);

// Create a new school
router.post('/', SchoolsController.create);

// Update a specific school
router.put('/:id', SchoolsController.update);

// Delete a specific school
router.delete('/:id', SchoolsController.destroy);

module.exports = router;
