const express = require('express');
const router = express.Router();
const availabilityController = require('../controllers/availabilityController');
const { auth } = require('../middleware/auth');

// Protect all routes
router.use(auth);

// Create a new availability
router.post('/', availabilityController.create);

// Get all availabilities for current user
router.get('/', availabilityController.getUserAvailabilities);

// Get availability by ID
router.get('/:availabilityId', availabilityController.getById);

// Update availability
router.put('/:availabilityId', availabilityController.update);

// Delete availability
router.delete('/:availabilityId', availabilityController.delete);

// Find available users for a match
router.get('/users/available', availabilityController.findAvailableUsers);

module.exports = router;