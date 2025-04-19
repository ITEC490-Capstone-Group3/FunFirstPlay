const app = require('./app');
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const logger = require('./utils/logger');
const { pool } = require('./config/db');
require('dotenv').config();

// Environment variables
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';
const NODE_ENV = 'production';
const DOMAIN = process.env.DOMAIN || 'funfirstplay.tech';
const ENABLE_HTTPS = process.env.ENABLE_HTTPS === 'true';

// Create server
let server;

if (ENABLE_HTTPS && NODE_ENV === 'production') {
  try {
    // Paths for SSL certificates
    const privateKeyPath = process.env.SSL_KEY_PATH || '/etc/letsencrypt/live/funfirstplay.tech/privkey.pem';
    const certificatePath = process.env.SSL_CERT_PATH || '/etc/letsencrypt/live/funfirstplay.tech/fullchain.pem';
    
    // Check if SSL files exist
    if (fs.existsSync(privateKeyPath) && fs.existsSync(certificatePath)) {
      const privateKey = fs.readFileSync(privateKeyPath, 'utf8');
      const certificate = fs.readFileSync(certificatePath, 'utf8');
      
      const credentials = {
        key: privateKey,
        cert: certificate
      };
      
      server = https.createServer(credentials, app);
      logger.info('Created HTTPS server with SSL certificates');
    } else {
      logger.warn('SSL certificates not found, falling back to HTTP server');
      server = http.createServer(app);
    }
  } catch (error) {
    logger.error(`Error setting up HTTPS: ${error.message}`);
    logger.warn('Falling back to HTTP server');
    server = http.createServer(app);
  }
} else {
  server = http.createServer(app);
  if (NODE_ENV === 'production') {
    logger.warn('Running production server without HTTPS. This is not recommended for production.');
  }
}

// Handle server errors
server.on('error', (error) => {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof PORT === 'string' ? 'Pipe ' + PORT : 'Port ' + PORT;

  // Handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      logger.error(`${bind} requires elevated privileges`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      logger.error(`${bind} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
});

// Start the server
server.listen(PORT, HOST, () => {
  logger.info(`Server running in production mode on ${HOST}:${PORT}`);
  
  // Log full server URL
  const protocol = ENABLE_HTTPS ? 'https' : 'http';
  logger.info(`Server URL: ${protocol}://${DOMAIN}`);
  logger.info(`Server started successfully`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise);
  logger.error('Reason:', reason);
  // Don't exit immediately in production, log the error but keep running
  if (NODE_ENV === 'production') {
    logger.error('Unhandled promise rejection detected. Check application logs.');
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  // Exit the process in case of an uncaught exception
  process.exit(1);
});

// Graceful shutdown
const gracefulShutdown = async (signal) => {
  logger.info(`${signal} signal received. Shutting down gracefully.`);
  
  // Close HTTP server first (stop accepting new connections)
  server.close(() => {
    logger.info('HTTP server closed.');
  });
  
  try {
    // Close database pool
    logger.info('Closing database connections...');
    await pool.end();
    logger.info('Database connections closed.');
    
    // Exit process
    logger.info('Shutdown completed successfully.');
    process.exit(0);
  } catch (error) {
    logger.error(`Error during shutdown: ${error.message}`);
    process.exit(1);
  }
  
  // Force shutdown if graceful shutdown fails
  setTimeout(() => {
    logger.error('Forced shutdown after timeout.');
    process.exit(1);
  }, 30000);
};

// Listen for termination signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
