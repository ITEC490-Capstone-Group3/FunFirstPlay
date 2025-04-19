const { successResponse, errorResponse } = require('../utils/apiResponse');
const skillLevelModel = require('../models/skillLevelModel');

const skillLevelController = {
  /**
   * Create a new skill level
   */
  create: async (req, res) => {
    try {
      const { name, description } = req.body;
      
      // Validate input
      if (!name) {
        return errorResponse(res, 400, 'Name is required');
      }
      
      const newSkillLevel = await skillLevelModel.create({
        name,
        description
      });
      
      return successResponse(res, 201, 'Skill level created successfully', { skillLevel: newSkillLevel });
    } catch (error) {
      console.error('Error in create skill level:', error);
      
      // Handle duplicate name error
      if (error.code === '23505' && error.constraint === 'skill_levels_name_key') {
        return errorResponse(res, 409, 'A skill level with this name already exists');
      }
      
      return errorResponse(res, 500, 'Internal server error');
    }
  },

  /**
   * Get all skill levels
   */
  getAll: async (req, res) => {
    try {
      const skillLevels = await skillLevelModel.getAll();
      
      return successResponse(res, 200, 'Skill levels retrieved successfully', { skillLevels });
    } catch (error) {
      console.error('Error in getAll skill levels:', error);
      return errorResponse(res, 500, 'Internal server error');
    }
  },

  /**
   * Get skill level by ID
   */
  getById: async (req, res) => {
    try {
      const { skillLevelId } = req.params;
      
      const skillLevel = await skillLevelModel.findById(skillLevelId);
      if (!skillLevel) {
        return errorResponse(res, 404, 'Skill level not found');
      }
      
      return successResponse(res, 200, 'Skill level retrieved successfully', { skillLevel });
    } catch (error) {
      console.error('Error in getById skill level:', error);
      return errorResponse(res, 500, 'Internal server error');
    }
  },

  /**
   * Update skill level
   */
  update: async (req, res) => {
    try {
      const { skillLevelId } = req.params;
      const { name, description } = req.body;
      
      const updatedSkillLevel = await skillLevelModel.update(skillLevelId, {
        name,
        description
      });
      
      if (!updatedSkillLevel) {
        return errorResponse(res, 404, 'Skill level not found');
      }
      
      return successResponse(res, 200, 'Skill level updated successfully', { skillLevel: updatedSkillLevel });
    } catch (error) {
      console.error('Error in update skill level:', error);
      
      // Handle duplicate name error
      if (error.code === '23505' && error.constraint === 'skill_levels_name_key') {
        return errorResponse(res, 409, 'A skill level with this name already exists');
      }
      
      return errorResponse(res, 500, 'Internal server error');
    }
  },

  /**
   * Delete skill level
   */
  delete: async (req, res) => {
    try {
      const { skillLevelId } = req.params;
      
      const deletedSkillLevel = await skillLevelModel.delete(skillLevelId);
      if (!deletedSkillLevel) {
        return errorResponse(res, 404, 'Skill level not found');
      }
      
      return successResponse(res, 200, 'Skill level deleted successfully');
    } catch (error) {
      console.error('Error in delete skill level:', error);
      return errorResponse(res, 500, 'Internal server error');
    }
  }
};

module.exports = skillLevelController;