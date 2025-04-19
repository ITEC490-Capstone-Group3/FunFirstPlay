const express = require('express');
const router = express.Router();
const matchController = require('../controllers/matchController');
const { auth } = require('../middleware/auth');

// Public routes
// Get all matches
router.get('/', matchController.getAll);

// Get match by ID
router.get('/:matchId', matchController.getById);

// Protected routes
router.use(auth);

// Get user's matches
router.get('/user/matches', matchController.getUserMatches);

// Create a new match
router.post('/', matchController.create);

// Update match
router.put('/:matchId', matchController.update);

// Delete match
router.delete('/:matchId', matchController.delete);

// Invite players to a match
router.post('/:matchId/invite', matchController.invitePlayers);

// Respond to match invitation
router.post('/:matchId/respond', matchController.respondToInvitation);

module.exports = router;