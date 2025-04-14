class SessionController {
    constructor(sessionModel) {
        this.sessionModel = sessionModel;
    }

    async createSession(req, res) {
        try {
            const session = await this.sessionModel.createSession(req.body);
            res.status(201).json(session);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getAllSessions(req, res) {
        try {
            const sessions = await this.sessionModel.getAllSessions();
            res.status(200).json(sessions);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async updateSession(req, res) {
        try {
            const session = await this.sessionModel.updateSession(req.params.id, req.body);
            res.status(200).json(session);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async deleteSession(req, res) {
        try {
            const success = await this.sessionModel.deleteSession(req.params.id);
            res.status(200).json({ success });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

export default SessionController;

// HI