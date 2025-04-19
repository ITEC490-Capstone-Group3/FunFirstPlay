const pool = require('../config/db');

const availabilityModel = {
  /**
   * Create a new availability
   */
  create: async (availabilityData) => {
    const { user_id, start_time, end_time, is_recurring, recurrence_rule, status } = availabilityData;
    
    const query = `
      INSERT INTO availability (user_id, start_time, end_time, is_recurring, recurrence_rule, status)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    
    const values = [user_id, start_time, end_time, is_recurring, recurrence_rule, status || 'active'];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  /**
   * Find availability by ID
   */
  findById: async (availabilityId) => {
    const query = `
      SELECT *
      FROM availability
      WHERE availability_id = $1
    `;
    
    const result = await pool.query(query, [availabilityId]);
    return result.rows[0];
  },

  /**
   * Update availability information
   */
  update: async (availabilityId, availabilityData) => {
    const { start_time, end_time, is_recurring, recurrence_rule, status } = availabilityData;
    
    const query = `
      UPDATE availability
      SET 
        start_time = COALESCE($1, start_time),
        end_time = COALESCE($2, end_time),
        is_recurring = COALESCE($3, is_recurring),
        recurrence_rule = COALESCE($4, recurrence_rule),
        status = COALESCE($5, status)
      WHERE availability_id = $6
      RETURNING *
    `;
    
    const values = [start_time, end_time, is_recurring, recurrence_rule, status, availabilityId];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  /**
   * Get all availabilities for a user
   */
  getByUserId: async (userId) => {
    const query = `
      SELECT *
      FROM availability
      WHERE user_id = $1
      ORDER BY start_time
    `;
    
    const result = await pool.query(query, [userId]);
    return result.rows;
  },

  /**
   * Delete availability
   */
  delete: async (availabilityId) => {
    const query = `
      DELETE FROM availability
      WHERE availability_id = $1
      RETURNING availability_id
    `;
    
    const result = await pool.query(query, [availabilityId]);
    return result.rows[0];
  },

  /**
   * Find users available during a specific time period
   */
  findAvailableUsers: async (startTime, endTime, sportId = null) => {
    let query = `
      SELECT DISTINCT u.user_id, u.username, u.first_name, u.last_name
      FROM users u
      JOIN availability a ON u.user_id = a.user_id
      WHERE a.status = 'active'
        AND a.start_time <= $1
        AND a.end_time >= $2
    `;
    
    let values = [startTime, endTime];
    
    if (sportId) {
      query += ` AND u.user_id IN (
        SELECT user_id FROM user_sports WHERE sport_id = $3
      )`;
      values.push(sportId);
    }
    
    const result = await pool.query(query, values);
    return result.rows;
  }
};

module.exports = availabilityModel;