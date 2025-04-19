const { successResponse, errorResponse } = require('../utils/apiResponse');
const sportModel = require('../models/sportModel');

const sportController = {
  /**
   * Create a new sport
   */
  create: async (req, res) => {
    try {
      const { name, description, min_players, max_players } = req.body;
      
      // Validate input
      if (!name || !min_players || !max_players) {
        return errorResponse(res, 400, 'Name, minimum players, and maximum players are required');
      }

      if (min_players <= 0 || max_players <= 0) {
        return errorResponse(res, 400, 'Players count must be greater than 0');
      }

      if (min_players > max_players) {
        return errorResponse(res, 400, 'Minimum players cannot be greater than maximum players');
      }
      
      const newSport = await sportModel.create({
        name,
        description,
        min_players,
        max_players
      });
      
      return successResponse(res, 201, 'Sport created successfully', { sport: newSport });
    } catch (error) {
      console.error('Error in create sport:', error);
      
      // Handle duplicate name error
      if (error.code === '23505' && error.constraint === 'sports_name_key') {
        return errorResponse(res, 409, 'A sport with this name already exists');
      }
      
      return errorResponse(res, 500, 'Internal server error');
    }
  },

  /**
   * Get all sports
   */
  getAll: async (req, res) => {
    try {
      const sports = await sportModel.getAll();
      
      return successResponse(res, 200, 'Sports retrieved successfully', { sports });
    } catch (error) {
      console.error('Error in getAll sports:', error);
      return errorResponse(res, 500, 'Internal server error');
    }
  },

  /**
   * Get sport by ID
   */
  getById: async (req, res) => {
    try {
      const { sportId } = req.params;
      
      const sport = await sportModel.findById(sportId);
      if (!sport) {
        return errorResponse(res, 404, 'Sport not found');
      }
      
      return successResponse(res, 200, 'Sport retrieved successfully', { sport });
    } catch (error) {
      console.error('Error in getById sport:', error);
      return errorResponse(res, 500, 'Internal server error');
    }
  },

  /**
   * Update sport
   */
  update: async (req, res) => {
    try {
      const { sportId } = req.params;
      const { name, description, min_players, max_players } = req.body;
      
      // Validate input for players if provided
      if (min_players !== undefined && max_players !== undefined) {
        if (min_players <= 0 || max_players <= 0) {
          return errorResponse(res, 400, 'Players count must be greater than 0');
        }

        if (min_players > max_players) {
          return errorResponse(res, 400, 'Minimum players cannot be greater than maximum players');
        }
      } else if (min_players !== undefined && max_players === undefined) {
        const sport = await sportModel.findById(sportId);
        if (min_players > sport.max_players) {
          return errorResponse(res, 400, 'Minimum players cannot be greater than maximum players');
        }
      } else if (max_players !== undefined && min_players === undefined) {
        const sport = await sportModel.findById(sportId);
        if (sport.min_players > max_players) {
          return errorResponse(res, 400, 'Minimum players cannot be greater than maximum players');
        }
      }
      
      const updatedSport = await sportModel.update(sportId, {
        name,
        description,
        min_players,
        max_players
      });
      
      if (!updatedSport) {
        return errorResponse(res, 404, 'Sport not found');
      }
      
      return successResponse(res, 200, 'Sport updated successfully', { sport: updatedSport });
    } catch (error) {
      console.error('Error in update sport:', error);
      
      // Handle duplicate name error
      if (error.code === '23505' && error.constraint === 'sports_name_key') {
        return errorResponse(res, 409, 'A sport with this name already exists');
      }
      
      return errorResponse(res, 500, 'Internal server error');
    }
  },

  /**
   * Delete sport
   */
  delete: async (req, res) => {
    try {
      const { sportId } = req.params;
      
      const deletedSport = await sportModel.delete(sportId);
      if (!deletedSport) {
        return errorResponse(res, 404, 'Sport not found');
      }
      
      return successResponse(res, 200, 'Sport deleted successfully');
    } catch (error) {
      console.error('Error in delete sport:', error);
      return errorResponse(res, 500, 'Internal server error');
    }
  }
};

module.exports = sportController;