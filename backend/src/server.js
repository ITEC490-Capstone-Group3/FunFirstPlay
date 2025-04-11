// Import dependencies
const dotenv = require('dotenv');
const app = require('./app');

// Load environment variables from .env file
dotenv.config();

// Define the port from environment variables or default to 5000
const PORT = process.env.PORT || 5000;

// Start the server
app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
}).on('error', (err) => {
    console.error(`❌ Server failed to start: ${err.message}`);
});