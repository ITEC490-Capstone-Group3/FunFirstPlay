const pool = require('../config/db');
const bcrypt = require('bcrypt');

const userModel = {
  /**
   * Create a new user
   */
  create: async (userData) => {
    const { username, email, password, first_name, last_name, phone } = userData;
    
    // Hash password
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);
    
    const query = `
      INSERT INTO users (username, email, password_hash, first_name, last_name, phone)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING user_id, username, email, first_name, last_name, phone, created_at, timezone
    `;
    
    const values = [username, email, password_hash, first_name, last_name, phone];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  /**
   * Find user by ID
   */
  findById: async (userId) => {
    const query = `
      SELECT user_id, username, email, first_name, last_name, phone, created_at, timezone, preferences, notifications_preferences
      FROM users
      WHERE user_id = $1
    `;
    
    const result = await pool.query(query, [userId]);
    return result.rows[0];
  },

  /**
   * Find user by username or email
   */
  findByCredentials: async (identifier) => {
    const query = `
      SELECT *
      FROM users
      WHERE username = $1 OR email = $1
    `;
    
    const result = await pool.query(query, [identifier]);
    return result.rows[0];
  },

  /**
   * Update user information
   */
  update: async (userId, userData) => {
    const { first_name, last_name, phone, timezone, preferences, notifications_preferences } = userData;
    
    const query = `
      UPDATE users
      SET 
        first_name = COALESCE($1, first_name),
        last_name = COALESCE($2, last_name),
        phone = COALESCE($3, phone),
        timezone = COALESCE($4, timezone),
        preferences = COALESCE($5, preferences),
        notifications_preferences = COALESCE($6, notifications_preferences)
      WHERE user_id = $7
      RETURNING user_id, username, email, first_name, last_name, phone, created_at, timezone, preferences, notifications_preferences
    `;
    
    const values = [first_name, last_name, phone, timezone, preferences, notifications_preferences, userId];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  /**
   * Get all users
   */
  getAll: async (limit = 100, offset = 0) => {
    const query = `
      SELECT user_id, username, email, first_name, last_name, created_at
      FROM users
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2
    `;
    
    const result = await pool.query(query, [limit, offset]);
    return result.rows;
  },

  /**
   * Delete user
   */
  delete: async (userId) => {
    const query = `
      DELETE FROM users
      WHERE user_id = $1
      RETURNING user_id
    `;
    
    const result = await pool.query(query, [userId]);
    return result.rows[0];
  },

  /**
   * Update user password
   */
  updatePassword: async (userId, newPassword) => {
    // Hash password
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(newPassword, saltRounds);
    
    const query = `
      UPDATE users
      SET password_hash = $1
      WHERE user_id = $2
      RETURNING user_id
    `;
    
    const result = await pool.query(query, [password_hash, userId]);
    return result.rows[0];
  },

  /**
   * Get user sports with skill levels
   */
  getUserSports: async (userId) => {
    const query = `
      SELECT us.user_sport_id, s.sport_id, s.name as sport_name, s.description as sport_description,
        sl.skill_level_id, sl.name as skill_level_name, sl.description as skill_level_description
      FROM user_sports us
      JOIN sports s ON us.sport_id = s.sport_id
      JOIN skill_levels sl ON us.skill_level_id = sl.skill_level_id
      WHERE us.user_id = $1
    `;
    
    const result = await pool.query(query, [userId]);
    return result.rows;
  }
};

module.exports = userModel;