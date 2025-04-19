const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { auth } = require('../middleware/auth');

// Public routes
// Register a new user
router.post('/register', authController.register);

// Login
router.post('/login', authController.login);

// Protected routes - require authentication
// Get current user profile
router.get('/profile', auth, authController.getProfile);

// Change password
router.post('/change-password', auth, authController.changePassword);

// Logout user
router.post('/logout', auth, authController.logout);

module.exports = router;