import pool from '../config/db.js';

class SessionModel {
    async createSession(sessionData) {
        const { name, description, date } = sessionData;
        const result = await pool.query(
            'INSERT INTO sessions (name, description, date) VALUES ($1, $2, $3) RETURNING *',
            [name, description, date]
        );
        return result.rows[0];
    }

    async getAllSessions() {
        const result = await pool.query('SELECT * FROM sessions');
        return result.rows;
    }

    async updateSession(id, sessionData) {
        const { name, description, date } = sessionData;
        const result = await pool.query(
            'UPDATE sessions SET name = $1, description = $2, date = $3 WHERE id = $4 RETURNING *',
            [name, description, date, id]
        );
        return result.rows[0];
    }

    async deleteSession(id) {
        const result = await pool.query('DELETE FROM sessions WHERE id = $1 RETURNING *', [id]);
        return result.rowCount > 0;
    }
}

export default new SessionModel();

// HI