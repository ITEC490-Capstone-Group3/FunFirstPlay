const pool = require('../config/db');

const skillLevelModel = {
  /**
   * Create a new skill level
   */
  create: async (skillData) => {
    const { name, description } = skillData;
    
    const query = `
      INSERT INTO skill_levels (name, description)
      VALUES ($1, $2)
      RETURNING *
    `;
    
    const values = [name, description];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  /**
   * Find skill level by ID
   */
  findById: async (skillLevelId) => {
    const query = `
      SELECT *
      FROM skill_levels
      WHERE skill_level_id = $1
    `;
    
    const result = await pool.query(query, [skillLevelId]);
    return result.rows[0];
  },

  /**
   * Update skill level information
   */
  update: async (skillLevelId, skillData) => {
    const { name, description } = skillData;
    
    const query = `
      UPDATE skill_levels
      SET 
        name = COALESCE($1, name),
        description = COALESCE($2, description)
      WHERE skill_level_id = $3
      RETURNING *
    `;
    
    const values = [name, description, skillLevelId];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  /**
   * Get all skill levels
   */
  getAll: async () => {
    const query = `
      SELECT *
      FROM skill_levels
      ORDER BY name
    `;
    
    const result = await pool.query(query);
    return result.rows;
  },

  /**
   * Delete skill level
   */
  delete: async (skillLevelId) => {
    const query = `
      DELETE FROM skill_levels
      WHERE skill_level_id = $1
      RETURNING skill_level_id
    `;
    
    const result = await pool.query(query, [skillLevelId]);
    return result.rows[0];
  }
};

module.exports = skillLevelModel;