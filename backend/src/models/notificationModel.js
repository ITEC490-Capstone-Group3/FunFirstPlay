const pool = require('../config/db');

const notificationModel = {
  /**
   * Create a new notification
   */
  create: async (notificationData) => {
    const { user_id, match_id, type, message, channel } = notificationData;
    
    const query = `
      INSERT INTO notifications (user_id, match_id, type, message, channel)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    
    const values = [user_id, match_id, type, message, channel || 'email'];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  /**
   * Find notification by ID
   */
  findById: async (notificationId) => {
    const query = `
      SELECT *
      FROM notifications
      WHERE notification_id = $1
    `;
    
    const result = await pool.query(query, [notificationId]);
    return result.rows[0];
  },

  /**
   * Update notification information
   */
  update: async (notificationId, notificationData) => {
    const { read_at, delivery_status } = notificationData;
    
    const query = `
      UPDATE notifications
      SET 
        read_at = COALESCE($1, read_at),
        delivery_status = COALESCE($2, delivery_status)
      WHERE notification_id = $3
      RETURNING *
    `;
    
    const values = [read_at, delivery_status, notificationId];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  /**
   * Mark notification as read
   */
  markAsRead: async (notificationId) => {
    const query = `
      UPDATE notifications
      SET read_at = NOW()
      WHERE notification_id = $1
      RETURNING *
    `;
    
    const result = await pool.query(query, [notificationId]);
    return result.rows[0];
  },

  /**
   * Get notifications for a user
   */
  getByUserId: async (userId, limit = 50, offset = 0, includeRead = false) => {
    let query = `
      SELECT n.*, m.sport_id, s.name as sport_name
      FROM notifications n
      LEFT JOIN matches m ON n.match_id = m.match_id
      LEFT JOIN sports s ON m.sport_id = s.sport_id
      WHERE n.user_id = $1
    `;
    
    if (!includeRead) {
      query += ` AND n.read_at IS NULL`;
    }
    
    query += `
      ORDER BY n.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    
    const values = [userId, limit, offset];
    
    const result = await pool.query(query, values);
    return result.rows;
  },

  /**
   * Delete notification
   */
  delete: async (notificationId) => {
    const query = `
      DELETE FROM notifications
      WHERE notification_id = $1
      RETURNING notification_id
    `;
    
    const result = await pool.query(query, [notificationId]);
    return result.rows[0];
  },

  /**
   * Count unread notifications for a user
   */
  countUnread: async (userId) => {
    const query = `
      SELECT COUNT(*) as count
      FROM notifications
      WHERE user_id = $1 AND read_at IS NULL
    `;
    
    const result = await pool.query(query, [userId]);
    return parseInt(result.rows[0].count, 10);
  },

  /**
   * Create match notification for all players
   */
  createForMatchPlayers: async (matchId, type, message, channel = 'email') => {
    const query = `
      INSERT INTO notifications (user_id, match_id, type, message, channel)
      SELECT mp.user_id, $1, $2, $3, $4
      FROM match_players mp
      WHERE mp.match_id = $1
      RETURNING *
    `;
    
    const values = [matchId, type, message, channel];
    
    const result = await pool.query(query, values);
    return result.rows;
  }
};

module.exports = notificationModel;