const pool = require('../config/db');

const matchModel = {
  /**
   * Create a new match
   */
  create: async (matchData) => {
    const {
      sport_id,
      start_time,
      end_time,
      location,
      status,
      required_skill_level,
      min_players,
      confirmation_deadline,
      auto_cancel
    } = matchData;
    
    const query = `
      INSERT INTO matches (
        sport_id,
        start_time,
        end_time,
        location,
        status,
        required_skill_level,
        min_players,
        confirmation_deadline,
        auto_cancel
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    
    const values = [
      sport_id,
      start_time,
      end_time,
      location,
      status || 'pending_confirmation',
      required_skill_level,
      min_players,
      confirmation_deadline,
      auto_cancel !== undefined ? auto_cancel : true
    ];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  /**
   * Find match by ID
   */
  findById: async (matchId) => {
    const query = `
      SELECT m.*, s.name as sport_name, sl.name as skill_level_name
      FROM matches m
      JOIN sports s ON m.sport_id = s.sport_id
      LEFT JOIN skill_levels sl ON m.required_skill_level = sl.skill_level_id
      WHERE m.match_id = $1
    `;
    
    const result = await pool.query(query, [matchId]);
    return result.rows[0];
  },

  /**
   * Update match information
   */
  update: async (matchId, matchData) => {
    const {
      start_time,
      end_time,
      location,
      status,
      required_skill_level,
      min_players,
      confirmed_players,
      confirmation_deadline,
      auto_cancel
    } = matchData;
    
    const query = `
      UPDATE matches
      SET 
        start_time = COALESCE($1, start_time),
        end_time = COALESCE($2, end_time),
        location = COALESCE($3, location),
        status = COALESCE($4, status),
        required_skill_level = COALESCE($5, required_skill_level),
        min_players = COALESCE($6, min_players),
        confirmed_players = COALESCE($7, confirmed_players),
        confirmation_deadline = COALESCE($8, confirmation_deadline),
        auto_cancel = COALESCE($9, auto_cancel)
      WHERE match_id = $10
      RETURNING *
    `;
    
    const values = [
      start_time,
      end_time,
      location,
      status,
      required_skill_level,
      min_players,
      confirmed_players,
      confirmation_deadline,
      auto_cancel,
      matchId
    ];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  /**
   * Get all matches
   */
  getAll: async (limit = 50, offset = 0, filters = {}) => {
    let query = `
      SELECT m.*, s.name as sport_name, sl.name as skill_level_name
      FROM matches m
      JOIN sports s ON m.sport_id = s.sport_id
      LEFT JOIN skill_levels sl ON m.required_skill_level = sl.skill_level_id
      WHERE 1=1
    `;
    
    const values = [];
    let paramCount = 1;
    
    // Apply filters
    if (filters.sport_id) {
      query += ` AND m.sport_id = $${paramCount}`;
      values.push(filters.sport_id);
      paramCount++;
    }
    
    if (filters.status) {
      query += ` AND m.status = $${paramCount}`;
      values.push(filters.status);
      paramCount++;
    }
    
    if (filters.from_date) {
      query += ` AND m.start_time >= $${paramCount}`;
      values.push(filters.from_date);
      paramCount++;
    }
    
    if (filters.to_date) {
      query += ` AND m.start_time <= $${paramCount}`;
      values.push(filters.to_date);
      paramCount++;
    }
    
    if (filters.skill_level_id) {
      query += ` AND m.required_skill_level = $${paramCount}`;
      values.push(filters.skill_level_id);
      paramCount++;
    }
    
    // Add order, limit and offset
    query += `
      ORDER BY m.start_time
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `;
    values.push(limit, offset);
    
    const result = await pool.query(query, values);
    return result.rows;
  },

  /**
   * Get matches for a specific user
   */
  getByUserId: async (userId, status = null) => {
    let query = `
      SELECT m.*, s.name as sport_name, sl.name as skill_level_name, mp.status as player_status
      FROM matches m
      JOIN sports s ON m.sport_id = s.sport_id
      LEFT JOIN skill_levels sl ON m.required_skill_level = sl.skill_level_id
      JOIN match_players mp ON m.match_id = mp.match_id
      WHERE mp.user_id = $1
    `;
    
    const values = [userId];
    
    if (status) {
      query += ` AND mp.status = $2`;
      values.push(status);
    }
    
    query += ` ORDER BY m.start_time`;
    
    const result = await pool.query(query, values);
    return result.rows;
  },

  /**
   * Delete match
   */
  delete: async (matchId) => {
    const query = `
      DELETE FROM matches
      WHERE match_id = $1
      RETURNING match_id
    `;
    
    const result = await pool.query(query, [matchId]);
    return result.rows[0];
  },

  /**
   * Add player to match
   */
  addPlayer: async (matchId, userId, status = 'invited') => {
    const query = `
      INSERT INTO match_players (match_id, user_id, status)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    
    const values = [matchId, userId, status];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  /**
   * Update player status
   */
  updatePlayerStatus: async (matchPlayerId, status, responded_at = new Date()) => {
    const query = `
      UPDATE match_players
      SET 
        status = $1,
        responded_at = $2
      WHERE match_player_id = $3
      RETURNING *
    `;
    
    const values = [status, responded_at, matchPlayerId];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  /**
   * Get players for a match
   */
  getPlayers: async (matchId) => {
    const query = `
      SELECT mp.*, u.username, u.first_name, u.last_name, u.email
      FROM match_players mp
      JOIN users u ON mp.user_id = u.user_id
      WHERE mp.match_id = $1
    `;
    
    const result = await pool.query(query, [matchId]);
    return result.rows;
  },

  /**
   * Find match player record
   */
  findMatchPlayer: async (matchId, userId) => {
    const query = `
      SELECT *
      FROM match_players
      WHERE match_id = $1 AND user_id = $2
    `;
    
    const result = await pool.query(query, [matchId, userId]);
    return result.rows[0];
  },

  /**
   * Add player response
   */
  addPlayerResponse: async (matchPlayerId, responseType, comment = null) => {
    const query = `
      INSERT INTO player_responses (match_player_id, response_type, comment)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    
    const values = [matchPlayerId, responseType, comment];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  /**
   * Get responses for a match player
   */
  getPlayerResponses: async (matchPlayerId) => {
    const query = `
      SELECT *
      FROM player_responses
      WHERE match_player_id = $1
      ORDER BY response_time DESC
    `;
    
    const result = await pool.query(query, [matchPlayerId]);
    return result.rows;
  },

  /**
   * Increment confirmed players count
   */
  incrementConfirmedPlayers: async (matchId) => {
    const query = `
      UPDATE matches
      SET confirmed_players = confirmed_players + 1
      WHERE match_id = $1
      RETURNING *
    `;
    
    const result = await pool.query(query, [matchId]);
    return result.rows[0];
  },

  /**
   * Decrement confirmed players count
   */
  decrementConfirmedPlayers: async (matchId) => {
    const query = `
      UPDATE matches
      SET confirmed_players = GREATEST(0, confirmed_players - 1)
      WHERE match_id = $1
      RETURNING *
    `;
    
    const result = await pool.query(query, [matchId]);
    return result.rows[0];
  }
};

module.exports = matchModel;