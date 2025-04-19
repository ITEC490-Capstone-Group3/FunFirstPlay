const { successResponse, errorResponse } = require('../utils/apiResponse');
const userModel = require('../models/userModel');
const sportModel = require('../models/sportModel');

const userController = {
  /**
   * Get all users
   */
  getAll: async (req, res) => {
    try {
      const { limit = 100, offset = 0 } = req.query;
      
      const users = await userModel.getAll(parseInt(limit), parseInt(offset));
      
      return successResponse(res, 200, 'Users retrieved successfully', { users });
    } catch (error) {
      console.error('Error in getAll users:', error);
      return errorResponse(res, 500, 'Internal server error');
    }
  },

  /**
   * Get user by ID
   */
  getById: async (req, res) => {
    try {
      const { userId } = req.params;
      
      const user = await userModel.findById(userId);
      if (!user) {
        return errorResponse(res, 404, 'User not found');
      }

      // Remove sensitive data
      delete user.password_hash;
      
      return successResponse(res, 200, 'User retrieved successfully', { user });
    } catch (error) {
      console.error('Error in getById user:', error);
      return errorResponse(res, 500, 'Internal server error');
    }
  },

  /**
   * Update user
   */
  update: async (req, res) => {
    try {
      // Only allow updating your own profile unless admin
      const isOwnProfile = req.user.userId === parseInt(req.params.userId);
      if (!isOwnProfile) {
        return errorResponse(res, 403, 'Not authorized to update this profile');
      }

      const { userId } = req.params;
      const { first_name, last_name, phone, timezone, preferences, notifications_preferences } = req.body;
      
      const updatedUser = await userModel.update(userId, {
        first_name,
        last_name,
        phone,
        timezone,
        preferences,
        notifications_preferences
      });
      
      if (!updatedUser) {
        return errorResponse(res, 404, 'User not found');
      }
      
      // Remove sensitive data
      delete updatedUser.password_hash;
      
      return successResponse(res, 200, 'User updated successfully', { user: updatedUser });
    } catch (error) {
      console.error('Error in update user:', error);
      return errorResponse(res, 500, 'Internal server error');
    }
  },

  /**
   * Delete user
   */
  delete: async (req, res) => {
    try {
      // Only allow deleting your own profile unless admin
      const isOwnProfile = req.user.userId === parseInt(req.params.userId);
      if (!isOwnProfile) {
        return errorResponse(res, 403, 'Not authorized to delete this profile');
      }

      const { userId } = req.params;
      
      const deletedUser = await userModel.delete(userId);
      if (!deletedUser) {
        return errorResponse(res, 404, 'User not found');
      }
      
      return successResponse(res, 200, 'User deleted successfully');
    } catch (error) {
      console.error('Error in delete user:', error);
      return errorResponse(res, 500, 'Internal server error');
    }
  },

  /**
   * Get user sports
   */
  getUserSports: async (req, res) => {
    try {
      const { userId } = req.params;
      
      const sports = await userModel.getUserSports(userId);
      
      return successResponse(res, 200, 'User sports retrieved successfully', { sports });
    } catch (error) {
      console.error('Error in getUserSports:', error);
      return errorResponse(res, 500, 'Internal server error');
    }
  },

  /**
   * Add sport to user
   */
  addSport: async (req, res) => {
    try {
      // Only allow adding sports to your own profile unless admin
      const isOwnProfile = req.user.userId === parseInt(req.params.userId);
      if (!isOwnProfile) {
        return errorResponse(res, 403, 'Not authorized to update this profile');
      }

      const { userId } = req.params;
      const { sport_id, skill_level_id } = req.body;
      
      if (!sport_id || !skill_level_id) {
        return errorResponse(res, 400, 'Sport ID and skill level ID are required');
      }
      
      const userSport = await sportModel.addUserSport(userId, sport_id, skill_level_id);
      
      return successResponse(res, 201, 'Sport added to user successfully', { userSport });
    } catch (error) {
      console.error('Error in addSport:', error);
      return errorResponse(res, 500, 'Internal server error');
    }
  },

  /**
   * Remove sport from user
   */
  removeSport: async (req, res) => {
    try {
      // Only allow removing sports from your own profile unless admin
      const isOwnProfile = req.user.userId === parseInt(req.params.userId);
      if (!isOwnProfile) {
        return errorResponse(res, 403, 'Not authorized to update this profile');
      }

      const { userId, userSportId } = req.params;
      
      const result = await sportModel.removeUserSport(userSportId);
      if (!result) {
        return errorResponse(res, 404, 'User sport not found');
      }
      
      return successResponse(res, 200, 'Sport removed from user successfully');
    } catch (error) {
      console.error('Error in removeSport:', error);
      return errorResponse(res, 500, 'Internal server error');
    }
  },

  /**
   * Update user sport skill level
   */
  updateSportSkill: async (req, res) => {
    try {
      // Only allow updating your own profile unless admin
      const isOwnProfile = req.user.userId === parseInt(req.params.userId);
      if (!isOwnProfile) {
        return errorResponse(res, 403, 'Not authorized to update this profile');
      }

      const { userId, userSportId } = req.params;
      const { skill_level_id } = req.body;
      
      if (!skill_level_id) {
        return errorResponse(res, 400, 'Skill level ID is required');
      }
      
      const updatedUserSport = await sportModel.updateUserSportSkill(userSportId, skill_level_id);
      if (!updatedUserSport) {
        return errorResponse(res, 404, 'User sport not found');
      }
      
      return successResponse(res, 200, 'User sport skill level updated successfully', { userSport: updatedUserSport });
    } catch (error) {
      console.error('Error in updateSportSkill:', error);
      return errorResponse(res, 500, 'Internal server error');
    }
  }
};

module.exports = userController;