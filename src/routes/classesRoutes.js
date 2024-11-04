// classesRoutes.js
const express = require('express');
const router = express.Router();
const classesController = require('../controllers/ClassesController');
const isAdmin = require('../middleware/isAdmin'); // Import the isAdmin middleware

// Use isAdmin to protect admin routes
router.post('/create', isAdmin, classesController.create);
router.put('/update/:id', isAdmin, classesController.update);
router.delete('/delete/:id', isAdmin, classesController.destroy);
router.get('/', classesController.index);
router.get('/:id', classesController.show);

module.exports = router;
