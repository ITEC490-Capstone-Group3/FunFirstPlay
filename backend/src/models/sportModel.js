const pool = require('../config/db');

const sportModel = {
  /**
   * Create a new sport
   */
  create: async (sportData) => {
    const { name, description, min_players, max_players } = sportData;
    
    const query = `
      INSERT INTO sports (name, description, min_players, max_players)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    
    const values = [name, description, min_players, max_players];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  /**
   * Find sport by ID
   */
  findById: async (sportId) => {
    const query = `
      SELECT *
      FROM sports
      WHERE sport_id = $1
    `;
    
    const result = await pool.query(query, [sportId]);
    return result.rows[0];
  },

  /**
   * Update sport information
   */
  update: async (sportId, sportData) => {
    const { name, description, min_players, max_players } = sportData;
    
    const query = `
      UPDATE sports
      SET 
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        min_players = COALESCE($3, min_players),
        max_players = COALESCE($4, max_players)
      WHERE sport_id = $5
      RETURNING *
    `;
    
    const values = [name, description, min_players, max_players, sportId];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  /**
   * Get all sports
   */
  getAll: async () => {
    const query = `
      SELECT *
      FROM sports
      ORDER BY name
    `;
    
    const result = await pool.query(query);
    return result.rows;
  },

  /**
   * Delete sport
   */
  delete: async (sportId) => {
    const query = `
      DELETE FROM sports
      WHERE sport_id = $1
      RETURNING sport_id
    `;
    
    const result = await pool.query(query, [sportId]);
    return result.rows[0];
  },

  /**
   * Add sport to user's profile
   */
  addUserSport: async (userId, sportId, skillLevelId) => {
    const query = `
      INSERT INTO user_sports (user_id, sport_id, skill_level_id)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    
    const values = [userId, sportId, skillLevelId];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  /**
   * Remove sport from user's profile
   */
  removeUserSport: async (userSportId) => {
    const query = `
      DELETE FROM user_sports
      WHERE user_sport_id = $1
      RETURNING user_sport_id
    `;
    
    const result = await pool.query(query, [userSportId]);
    return result.rows[0];
  },

  /**
   * Update user's sport skill level
   */
  updateUserSportSkill: async (userSportId, skillLevelId) => {
    const query = `
      UPDATE user_sports
      SET skill_level_id = $1
      WHERE user_sport_id = $2
      RETURNING *
    `;
    
    const values = [skillLevelId, userSportId];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }
};

module.exports = sportModel;