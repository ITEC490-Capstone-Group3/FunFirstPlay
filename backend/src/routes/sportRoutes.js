const express = require('express');
const router = express.Router();
const sportController = require('../controllers/sportController');
const { auth, authorize } = require('../middleware/auth');

// Public routes
// Get all sports
router.get('/', sportController.getAll);

// Get sport by ID
router.get('/:sportId', sportController.getById);

// Protected routes
router.use(auth);

// Create a new sport
router.post('/', sportController.create);

// Update sport
router.put('/:sportId', sportController.update);

// Delete sport
router.delete('/:sportId', sportController.delete);

module.exports = router;