const { successResponse, errorResponse } = require('../utils/apiResponse');
const matchModel = require('../models/matchModel');
const notificationModel = require('../models/notificationModel');
const sportModel = require('../models/sportModel');

const matchController = {
  /**
   * Create a new match
   */
  create: async (req, res) => {
    try {
      const {
        sport_id,
        start_time,
        end_time,
        location,
        required_skill_level,
        min_players,
        confirmation_deadline,
        auto_cancel,
        player_ids
      } = req.body;
      
      // Validate input
      if (!sport_id || !start_time || !end_time || !min_players || !confirmation_deadline) {
        return errorResponse(res, 400, 'Missing required fields');
      }

      // Validate time logic
      const startDate = new Date(start_time);
      const endDate = new Date(end_time);
      const deadlineDate = new Date(confirmation_deadline);
      
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()) || isNaN(deadlineDate.getTime())) {
        return errorResponse(res, 400, 'Invalid date format');
      }

      if (endDate <= startDate) {
        return errorResponse(res, 400, 'End time must be after start time');
      }

      if (deadlineDate >= startDate) {
        return errorResponse(res, 400, 'Confirmation deadline must be before match start time');
      }

      // Verify that the sport exists
      const sport = await sportModel.findById(sport_id);
      if (!sport) {
        return errorResponse(res, 404, 'Sport not found');
      }

      // Create the match
      const newMatch = await matchModel.create({
        sport_id,
        start_time,
        end_time,
        location,
        status: 'pending_confirmation',
        required_skill_level,
        min_players,
        confirmation_deadline,
        auto_cancel
      });
      
      // Add creator as first player with confirmed status
      const matchCreator = await matchModel.addPlayer(newMatch.match_id, req.user.userId, 'confirmed');
      
      // Increment confirmed players count
      await matchModel.incrementConfirmedPlayers(newMatch.match_id);
      
      // Add other players if provided
      if (player_ids && Array.isArray(player_ids) && player_ids.length > 0) {
        // Filter out the creator if included
        const uniquePlayers = [...new Set(player_ids)].filter(id => id !== req.user.userId);
        
        // Add each player
        const playerPromises = uniquePlayers.map(playerId => 
          matchModel.addPlayer(newMatch.match_id, playerId, 'invited')
        );
        
        await Promise.all(playerPromises);
        
        // Create notifications for invited players
        const message = `You've been invited to play ${sport.name} on ${new Date(start_time).toLocaleDateString()} at ${location || 'TBD'}`;
        await notificationModel.createForMatchPlayers(
          newMatch.match_id,
          'match_invitation',
          message
        );
      }
      
      return successResponse(res, 201, 'Match created successfully', { match: newMatch });
    } catch (error) {
      console.error('Error in create match:', error);
      return errorResponse(res, 500, 'Internal server error');
    }
  },

  /**
   * Get all matches with filters
   */
  getAll: async (req, res) => {
    try {
      const { 
        limit = 50, 
        offset = 0, 
        sport_id, 
        status,
        from_date,
        to_date,
        skill_level_id
      } = req.query;
      
      const filters = {};
      
      if (sport_id) filters.sport_id = parseInt(sport_id);
      if (status) filters.status = status;
      if (from_date) filters.from_date = from_date;
      if (to_date) filters.to_date = to_date;
      if (skill_level_id) filters.skill_level_id = parseInt(skill_level_id);
      
      const matches = await matchModel.getAll(
        parseInt(limit),
        parseInt(offset),
        filters
      );
      
      return successResponse(res, 200, 'Matches retrieved successfully', { matches });
    } catch (error) {
      console.error('Error in getAll matches:', error);
      return errorResponse(res, 500, 'Internal server error');
    }
  },

  /**
   * Get user's matches
   */
  getUserMatches: async (req, res) => {
    try {
      const userId = req.user.userId;
      const { status } = req.query;
      
      const matches = await matchModel.getByUserId(userId, status);
      
      return successResponse(res, 200, 'User matches retrieved successfully', { matches });
    } catch (error) {
      console.error('Error in getUserMatches:', error);
      return errorResponse(res, 500, 'Internal server error');
    }
  },

  /**
   * Get match by ID
   */
  getById: async (req, res) => {
    try {
      const { matchId } = req.params;
      
      const match = await matchModel.findById(matchId);
      if (!match) {
        return errorResponse(res, 404, 'Match not found');
      }
      
      // Get players for the match
      const players = await matchModel.getPlayers(matchId);
      
      return successResponse(res, 200, 'Match retrieved successfully', { 
        match,
        players
      });
    } catch (error) {
      console.error('Error in getById match:', error);
      return errorResponse(res, 500, 'Internal server error');
    }
  },

  /**
   * Update match
   */
  update: async (req, res) => {
    try {
      const { matchId } = req.params;
      const {
        start_time,
        end_time,
        location,
        status,
        required_skill_level,
        min_players,
        confirmation_deadline,
        auto_cancel
      } = req.body;
      
      // Find the match
      const match = await matchModel.findById(matchId);
      if (!match) {
        return errorResponse(res, 404, 'Match not found');
      }
      
      // Check permissions - only match creator (first confirmed player) can update
      const players = await matchModel.getPlayers(matchId);
      const creator = players.find(p => p.status === 'confirmed');
      
      if (!creator || creator.user_id !== req.user.userId) {
        return errorResponse(res, 403, 'Not authorized to update this match');
      }
      
      // Validate time logic if changing times
      if (start_time && end_time) {
        const startDate = new Date(start_time);
        const endDate = new Date(end_time);
        
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          return errorResponse(res, 400, 'Invalid date format');
        }

        if (endDate <= startDate) {
          return errorResponse(res, 400, 'End time must be after start time');
        }
      }
      
      if (confirmation_deadline) {
        const deadlineDate = new Date(confirmation_deadline);
        const startDate = start_time ? new Date(start_time) : new Date(match.start_time);
        
        if (isNaN(deadlineDate.getTime())) {
          return errorResponse(res, 400, 'Invalid date format');
        }

        if (deadlineDate >= startDate) {
          return errorResponse(res, 400, 'Confirmation deadline must be before match start time');
        }
      }
      
      // Update the match
      const updatedMatch = await matchModel.update(matchId, {
        start_time,
        end_time,
        location,
        status,
        required_skill_level,
        min_players,
        confirmation_deadline,
        auto_cancel
      });
      
      // If status changed to canceled, notify all players
      if (status === 'canceled' && match.status !== 'canceled') {
        const message = `The ${match.sport_name} match on ${new Date(match.start_time).toLocaleDateString()} has been canceled.`;
        await notificationModel.createForMatchPlayers(
          matchId,
          'match_canceled',
          message
        );
      }
      
      // If match details updated, notify all confirmed players
      if (
        (start_time && start_time !== match.start_time) ||
        (end_time && end_time !== match.end_time) ||
        (location && location !== match.location)
      ) {
        const message = `The ${match.sport_name} match details have been updated. Please check the new schedule.`;
        await notificationModel.createForMatchPlayers(
          matchId,
          'match_updated',
          message
        );
      }
      
      return successResponse(res, 200, 'Match updated successfully', { match: updatedMatch });
    } catch (error) {
      console.error('Error in update match:', error);
      return errorResponse(res, 500, 'Internal server error');
    }
  },

  /**
   * Delete match
   */
  delete: async (req, res) => {
    try {
      const { matchId } = req.params;
      
      // Find the match
      const match = await matchModel.findById(matchId);
      if (!match) {
        return errorResponse(res, 404, 'Match not found');
      }
      
      // Check permissions - only match creator (first confirmed player) can delete
      const players = await matchModel.getPlayers(matchId);
      const creator = players.find(p => p.status === 'confirmed');
      
      if (!creator || creator.user_id !== req.user.userId) {
        return errorResponse(res, 403, 'Not authorized to delete this match');
      }
      
      // Notify all players before deletion
      const message = `The ${match.sport_name} match on ${new Date(match.start_time).toLocaleDateString()} has been canceled.`;
      await notificationModel.createForMatchPlayers(
        matchId,
        'match_canceled',
        message
      );
      
      // Delete the match
      await matchModel.delete(matchId);
      
      return successResponse(res, 200, 'Match deleted successfully');
    } catch (error) {
      console.error('Error in delete match:', error);
      return errorResponse(res, 500, 'Internal server error');
    }
  },

  /**
   * Invite players to a match
   */
  invitePlayers: async (req, res) => {
    try {
      const { matchId } = req.params;
      const { player_ids } = req.body;
      
      if (!player_ids || !Array.isArray(player_ids) || player_ids.length === 0) {
        return errorResponse(res, 400, 'Player IDs are required');
      }
      
      // Find the match
      const match = await matchModel.findById(matchId);
      if (!match) {
        return errorResponse(res, 404, 'Match not found');
      }
      
      // Check permissions - only match creator or confirmed players can invite others
      const matchPlayer = await matchModel.findMatchPlayer(matchId, req.user.userId);
      if (!matchPlayer || matchPlayer.status !== 'confirmed') {
        return errorResponse(res, 403, 'Not authorized to invite players to this match');
      }
      
      // Get existing players to avoid duplicates
      const existingPlayers = await matchModel.getPlayers(matchId);
      const existingPlayerIds = existingPlayers.map(p => p.user_id);
      
      // Filter out players already in the match
      const newPlayerIds = player_ids.filter(id => !existingPlayerIds.includes(parseInt(id)));
      
      if (newPlayerIds.length === 0) {
        return errorResponse(res, 400, 'All players are already invited to this match');
      }
      
      // Add each player
      const playerPromises = newPlayerIds.map(playerId => 
        matchModel.addPlayer(matchId, playerId, 'invited')
      );
      
      await Promise.all(playerPromises);
      
      // Create notifications for invited players
      const sport = await sportModel.findById(match.sport_id);
      const message = `You've been invited to play ${sport.name} on ${new Date(match.start_time).toLocaleDateString()} at ${match.location || 'TBD'}`;
      
      // Only create notifications for newly invited players
      for (const playerId of newPlayerIds) {
        await notificationModel.create({
          user_id: playerId,
          match_id: matchId,
          type: 'match_invitation',
          message
        });
      }
      
      return successResponse(res, 200, 'Players invited successfully');
    } catch (error) {
      console.error('Error in invitePlayers:', error);
      return errorResponse(res, 500, 'Internal server error');
    }
  },

  /**
   * Respond to match invitation
   */
  respondToInvitation: async (req, res) => {
    try {
      const { matchId } = req.params;
      const { response, comment } = req.body;
      
      if (!response || !['accepted', 'declined', 'maybe'].includes(response)) {
        return errorResponse(res, 400, 'Valid response is required (accepted, declined, or maybe)');
      }
      
      // Find the match
      const match = await matchModel.findById(matchId);
      if (!match) {
        return errorResponse(res, 404, 'Match not found');
      }
      
      // Find match player record
      const matchPlayer = await matchModel.findMatchPlayer(matchId, req.user.userId);
      if (!matchPlayer) {
        return errorResponse(res, 404, 'You are not invited to this match');
      }
      
      if (matchPlayer.status !== 'invited' && matchPlayer.status !== 'maybe') {
        return errorResponse(res, 400, `Cannot respond to invitation with current status: ${matchPlayer.status}`);
      }
      
      // Update player status based on response
      let newStatus;
      if (response === 'accepted') {
        newStatus = 'confirmed';
        await matchModel.incrementConfirmedPlayers(matchId);
      } else if (response === 'declined') {
        newStatus = 'declined';
      } else if (response === 'maybe') {
        newStatus = 'maybe';
      }
      
      await matchModel.updatePlayerStatus(matchPlayer.match_player_id, newStatus);
      
      // Add response record
      await matchModel.addPlayerResponse(matchPlayer.match_player_id, response, comment);
      
      // Notify match creator
      const players = await matchModel.getPlayers(matchId);
      const creator = players.find(p => p.status === 'confirmed' && p.user_id !== req.user.userId);
      
      if (creator) {
        const user = players.find(p => p.user_id === req.user.userId);
        const message = `${user.first_name} ${user.last_name} has ${response} your invitation to the ${match.sport_name} match.`;
        
        await notificationModel.create({
          user_id: creator.user_id,
          match_id: matchId,
          type: 'invitation_response',
          message
        });
      }
      
      return successResponse(res, 200, 'Response recorded successfully');
    } catch (error) {
      console.error('Error in respondToInvitation:', error);
      return errorResponse(res, 500, 'Internal server error');
    }
  }
};

module.exports = matchController;