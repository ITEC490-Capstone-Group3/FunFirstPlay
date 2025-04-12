const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

// Initialize the app
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Example route
app.get('/', (req, res) => {
    res.send('Welcome to the FunFirstPlay API!');
});

// Export the app
module.exports = app;