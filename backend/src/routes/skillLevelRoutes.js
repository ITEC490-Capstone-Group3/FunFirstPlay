const express = require('express');
const router = express.Router();
const skillLevelController = require('../controllers/skillLevelController');
const { auth, authorize } = require('../middleware/auth');

// Public routes
// Get all skill levels
router.get('/', skillLevelController.getAll);

// Get skill level by ID
router.get('/:skillLevelId', skillLevelController.getById);

// Protected routes
router.use(auth);

// Create a new skill level
router.post('/', skillLevelController.create);

// Update skill level
router.put('/:skillLevelId', skillLevelController.update);

// Delete skill level
router.delete('/:skillLevelId', skillLevelController.delete);

module.exports = router;