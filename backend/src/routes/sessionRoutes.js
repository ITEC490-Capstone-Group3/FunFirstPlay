import express from 'express';

const router = express.Router();

export default (sessionController) => {
    router.post('/', sessionController.createSession.bind(sessionController));
    router.get('/', sessionController.getAllSessions.bind(sessionController));
    router.put('/:id', sessionController.updateSession.bind(sessionController));
    router.delete('/:id', sessionController.deleteSession.bind(sessionController));
    return router;
};