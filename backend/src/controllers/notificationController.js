const { successResponse, errorResponse } = require('../utils/apiResponse');
const notificationModel = require('../models/notificationModel');

const notificationController = {
  /**
   * Get user's notifications
   */
  getUserNotifications: async (req, res) => {
    try {
      const userId = req.user.userId;
      const { limit = 50, offset = 0, include_read = false } = req.query;
      
      const notifications = await notificationModel.getByUserId(
        userId,
        parseInt(limit),
        parseInt(offset),
        include_read === 'true' || include_read === true
      );
      
      // Get unread count
      const unreadCount = await notificationModel.countUnread(userId);
      
      return successResponse(res, 200, 'Notifications retrieved successfully', { 
        notifications,
        unread_count: unreadCount 
      });
    } catch (error) {
      console.error('Error in getUserNotifications:', error);
      return errorResponse(res, 500, 'Internal server error');
    }
  },

  /**
   * Get notification by ID
   */
  getById: async (req, res) => {
    try {
      const { notificationId } = req.params;
      
      const notification = await notificationModel.findById(notificationId);
      if (!notification) {
        return errorResponse(res, 404, 'Notification not found');
      }

      // Ensure user can only access their own notifications
      if (notification.user_id !== req.user.userId) {
        return errorResponse(res, 403, 'Not authorized to access this notification');
      }
      
      return successResponse(res, 200, 'Notification retrieved successfully', { notification });
    } catch (error) {
      console.error('Error in getById notification:', error);
      return errorResponse(res, 500, 'Internal server error');
    }
  },

  /**
   * Mark notification as read
   */
  markAsRead: async (req, res) => {
    try {
      const { notificationId } = req.params;
      
      // Find notification to check ownership
      const notification = await notificationModel.findById(notificationId);
      if (!notification) {
        return errorResponse(res, 404, 'Notification not found');
      }

      // Ensure user can only mark their own notifications
      if (notification.user_id !== req.user.userId) {
        return errorResponse(res, 403, 'Not authorized to update this notification');
      }

      // Skip if already read
      if (notification.read_at) {
        return successResponse(res, 200, 'Notification already marked as read', { notification });
      }
      
      const updatedNotification = await notificationModel.markAsRead(notificationId);
      
      return successResponse(res, 200, 'Notification marked as read', { notification: updatedNotification });
    } catch (error) {
      console.error('Error in markAsRead notification:', error);
      return errorResponse(res, 500, 'Internal server error');
    }
  },

  /**
   * Mark all notifications as read
   */
  markAllAsRead: async (req, res) => {
    try {
      const userId = req.user.userId;
      
      // Get all unread notifications
      const notifications = await notificationModel.getByUserId(userId, 1000, 0, false);
      
      // Mark each as read
      const markPromises = notifications.map(notification => 
        notificationModel.markAsRead(notification.notification_id)
      );
      
      await Promise.all(markPromises);
      
      return successResponse(res, 200, 'All notifications marked as read');
    } catch (error) {
      console.error('Error in markAllAsRead:', error);
      return errorResponse(res, 500, 'Internal server error');
    }
  },

  /**
   * Delete notification
   */
  delete: async (req, res) => {
    try {
      const { notificationId } = req.params;
      
      // Find notification to check ownership
      const notification = await notificationModel.findById(notificationId);
      if (!notification) {
        return errorResponse(res, 404, 'Notification not found');
      }

      // Ensure user can only delete their own notifications
      if (notification.user_id !== req.user.userId) {
        return errorResponse(res, 403, 'Not authorized to delete this notification');
      }
      
      await notificationModel.delete(notificationId);
      
      return successResponse(res, 200, 'Notification deleted successfully');
    } catch (error) {
      console.error('Error in delete notification:', error);
      return errorResponse(res, 500, 'Internal server error');
    }
  },

  /**
   * Get unread notification count
   */
  getUnreadCount: async (req, res) => {
    try {
      const userId = req.user.userId;
      
      const count = await notificationModel.countUnread(userId);
      
      return successResponse(res, 200, 'Unread notification count retrieved', { count });
    } catch (error) {
      console.error('Error in getUnreadCount:', error);
      return errorResponse(res, 500, 'Internal server error');
    }
  }
};

module.exports = notificationController;