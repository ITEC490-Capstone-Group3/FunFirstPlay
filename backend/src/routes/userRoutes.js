const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { auth, authorize } = require('../middleware/auth');

// Protect all routes
router.use(auth);

// Get all users (admin only in production)
router.get('/', 
  process.env.NODE_ENV === 'production' ? authorize(['admin']) : (req, res, next) => next(), 
  userController.getAll
);

// Get user by ID
router.get('/:userId', userController.getById);

// Update user
router.put('/:userId', userController.update);

// Delete user
router.delete('/:userId', userController.delete);

// Get user sports
router.get('/:userId/sports', userController.getUserSports);

// Add sport to user
router.post('/:userId/sports', userController.addSport);

// Remove sport from user
router.delete('/:userId/sports/:userSportId', userController.removeSport);

// Update user sport skill level
router.put('/:userId/sports/:userSportId', userController.updateSportSkill);

module.exports = router;