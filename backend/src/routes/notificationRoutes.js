const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { auth } = require('../middleware/auth');

// Protect all routes
router.use(auth);

// Get user's notifications
router.get('/', notificationController.getUserNotifications);

// Get unread notification count
router.get('/unread/count', notificationController.getUnreadCount);

// Mark all notifications as read
router.post('/mark-all-read', notificationController.markAllAsRead);

// Get notification by ID
router.get('/:notificationId', notificationController.getById);

// Mark notification as read
router.put('/:notificationId/read', notificationController.markAsRead);

// Delete notification
router.delete('/:notificationId', notificationController.delete);

module.exports = router;