import express from 'express';
import path from 'path';
import sessionRoutes from './routes/sessionRoutes.js';
import SessionController from './controllers/sessionController.js';
import sessionModel from './models/sessionModel.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, '../../frontend')));

// API Routes
const sessionController = new SessionController(sessionModel);
app.use('/api/sessions', sessionRoutes(sessionController));

// Fallback to serve index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/index.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});