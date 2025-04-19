const sessionModel = require('../models/sessionModel');

const sessionController = {
    /**
     * Create a new session
     */
    createSession: async (req, res) => {
        try {
            const session = await sessionModel.createSession(req.body);
            res.status(201).json(session);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    /**
     * Get all sessions
     */
    getAllSessions: async (req, res) => {
        try {
            const sessions = await sessionModel.getAllSessions();
            res.status(200).json(sessions);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    /**
     * Update a session
     */
    updateSession: async (req, res) => {
        try {
            const session = await sessionModel.updateSession(req.params.id, req.body);
            if (!session) {
                return res.status(404).json({ error: 'Session not found' });
            }
            res.status(200).json(session);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    /**
     * Delete a session
     */
    deleteSession: async (req, res) => {
        try {
            const success = await sessionModel.deleteSession(req.params.id);
            if (!success) {
                return res.status(404).json({ error: 'Session not found' });
            }
            res.status(200).json({ success });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};

module.exports = sessionController;
