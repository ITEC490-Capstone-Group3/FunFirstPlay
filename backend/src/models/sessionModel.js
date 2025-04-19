const pool = require('../config/db');

const sessionModel = {
    /**
     * Create a new session
     */
    createSession: async (sessionData) => {
        const { name, description, date } = sessionData;
        const result = await pool.query(
            'INSERT INTO sessions (name, description, date) VALUES ($1, $2, $3) RETURNING *',
            [name, description, date]
        );
        return result.rows[0];
    },

    /**
     * Get all sessions
     */
    getAllSessions: async () => {
        const result = await pool.query('SELECT * FROM sessions');
        return result.rows;
    },

    /**
     * Update a session
     */
    updateSession: async (id, sessionData) => {
        const { name, description, date } = sessionData;
        const result = await pool.query(
            'UPDATE sessions SET name = $1, description = $2, date = $3 WHERE id = $4 RETURNING *',
            [name, description, date, id]
        );
        return result.rows[0];
    },

    /**
     * Delete a session
     */
    deleteSession: async (id) => {
        const result = await pool.query('DELETE FROM sessions WHERE id = $1 RETURNING *', [id]);
        return result.rowCount > 0;
    }
};

module.exports = sessionModel;
