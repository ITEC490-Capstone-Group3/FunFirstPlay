const { successResponse, errorResponse } = require('../utils/apiResponse');
const availabilityModel = require('../models/availabilityModel');

const availabilityController = {
  /**
   * Create a new availability
   */
  create: async (req, res) => {
    try {
      const { start_time, end_time, is_recurring, recurrence_rule, status } = req.body;
      const user_id = req.user.userId;
      
      // Validate input
      if (!start_time || !end_time) {
        return errorResponse(res, 400, 'Start time and end time are required');
      }

      // Validate time logic
      const startDate = new Date(start_time);
      const endDate = new Date(end_time);
      
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return errorResponse(res, 400, 'Invalid date format');
      }

      if (endDate <= startDate) {
        return errorResponse(res, 400, 'End time must be after start time');
      }
      
      const newAvailability = await availabilityModel.create({
        user_id,
        start_time,
        end_time,
        is_recurring,
        recurrence_rule,
        status
      });
      
      return successResponse(res, 201, 'Availability created successfully', { availability: newAvailability });
    } catch (error) {
      console.error('Error in create availability:', error);
      return errorResponse(res, 500, 'Internal server error');
    }
  },

  /**
   * Get all availabilities for current user
   */
  getUserAvailabilities: async (req, res) => {
    try {
      const userId = req.user.userId;
      
      const availabilities = await availabilityModel.getByUserId(userId);
      
      return successResponse(res, 200, 'Availabilities retrieved successfully', { availabilities });
    } catch (error) {
      console.error('Error in getUserAvailabilities:', error);
      return errorResponse(res, 500, 'Internal server error');
    }
  },

  /**
   * Get availability by ID
   */
  getById: async (req, res) => {
    try {
      const { availabilityId } = req.params;
      
      const availability = await availabilityModel.findById(availabilityId);
      if (!availability) {
        return errorResponse(res, 404, 'Availability not found');
      }

      // Ensure user can only access their own availabilities
      if (availability.user_id !== req.user.userId) {
        return errorResponse(res, 403, 'Not authorized to access this availability');
      }
      
      return successResponse(res, 200, 'Availability retrieved successfully', { availability });
    } catch (error) {
      console.error('Error in getById availability:', error);
      return errorResponse(res, 500, 'Internal server error');
    }
  },

  /**
   * Update availability
   */
  update: async (req, res) => {
    try {
      const { availabilityId } = req.params;
      const { start_time, end_time, is_recurring, recurrence_rule, status } = req.body;
      
      // First find the availability to check ownership
      const availability = await availabilityModel.findById(availabilityId);
      if (!availability) {
        return errorResponse(res, 404, 'Availability not found');
      }

      // Ensure user can only update their own availabilities
      if (availability.user_id !== req.user.userId) {
        return errorResponse(res, 403, 'Not authorized to update this availability');
      }

      // If updating times, validate them
      if (start_time && end_time) {
        const startDate = new Date(start_time);
        const endDate = new Date(end_time);
        
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          return errorResponse(res, 400, 'Invalid date format');
        }

        if (endDate <= startDate) {
          return errorResponse(res, 400, 'End time must be after start time');
        }
      } else if (start_time) {
        const startDate = new Date(start_time);
        const endDate = new Date(availability.end_time);
        
        if (isNaN(startDate.getTime())) {
          return errorResponse(res, 400, 'Invalid date format');
        }

        if (endDate <= startDate) {
          return errorResponse(res, 400, 'End time must be after start time');
        }
      } else if (end_time) {
        const startDate = new Date(availability.start_time);
        const endDate = new Date(end_time);
        
        if (isNaN(endDate.getTime())) {
          return errorResponse(res, 400, 'Invalid date format');
        }

        if (endDate <= startDate) {
          return errorResponse(res, 400, 'End time must be after start time');
        }
      }
      
      const updatedAvailability = await availabilityModel.update(availabilityId, {
        start_time,
        end_time,
        is_recurring,
        recurrence_rule,
        status
      });
      
      return successResponse(res, 200, 'Availability updated successfully', { availability: updatedAvailability });
    } catch (error) {
      console.error('Error in update availability:', error);
      return errorResponse(res, 500, 'Internal server error');
    }
  },

  /**
   * Delete availability
   */
  delete: async (req, res) => {
    try {
      const { availabilityId } = req.params;
      
      // First find the availability to check ownership
      const availability = await availabilityModel.findById(availabilityId);
      if (!availability) {
        return errorResponse(res, 404, 'Availability not found');
      }

      // Ensure user can only delete their own availabilities
      if (availability.user_id !== req.user.userId) {
        return errorResponse(res, 403, 'Not authorized to delete this availability');
      }
      
      await availabilityModel.delete(availabilityId);
      
      return successResponse(res, 200, 'Availability deleted successfully');
    } catch (error) {
      console.error('Error in delete availability:', error);
      return errorResponse(res, 500, 'Internal server error');
    }
  },

  /**
   * Find available users for a match
   */
  findAvailableUsers: async (req, res) => {
    try {
      const { start_time, end_time, sport_id } = req.query;
      
      // Validate input
      if (!start_time || !end_time) {
        return errorResponse(res, 400, 'Start time and end time are required');
      }

      // Validate time logic
      const startDate = new Date(start_time);
      const endDate = new Date(end_time);
      
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return errorResponse(res, 400, 'Invalid date format');
      }

      if (endDate <= startDate) {
        return errorResponse(res, 400, 'End time must be after start time');
      }
      
      const availableUsers = await availabilityModel.findAvailableUsers(
        start_time,
        end_time,
        sport_id ? parseInt(sport_id) : null
      );
      
      return successResponse(res, 200, 'Available users retrieved successfully', { users: availableUsers });
    } catch (error) {
      console.error('Error in findAvailableUsers:', error);
      return errorResponse(res, 500, 'Internal server error');
    }
  }
};

module.exports = availabilityController;