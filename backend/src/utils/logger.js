const winston = require('winston');
const path = require('path');
require('dotenv').config();

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define log level from environment or use default
const level = () => {
  return process.env.LOG_LEVEL || 'info';
};

// Define colors for each log level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};

// Add colors to Winston
winston.addColors(colors);

// Use standard Linux log directory
const LOG_DIR = '/var/log/funfirstplay';

// Create log directory if it doesn't exist
const fs = require('fs');
try {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
} catch (error) {
  console.error(`Error creating log directory: ${error.message}`);
}

// Define format based on LOG_FORMAT env variable
const getFormat = () => {
  const formatType = process.env.LOG_FORMAT || 'simple';
  
  // Base timestamp format
  const timestampFormat = winston.format.timestamp({ 
    format: 'YYYY-MM-DD HH:mm:ss.SSS'
  });
  
  if (formatType === 'json') {
    // JSON format
    return winston.format.combine(
      timestampFormat,
      winston.format.errors({ stack: true }),
      winston.format.json()
    );
  } else {
    // Simple format
    return winston.format.combine(
      timestampFormat,
      winston.format.errors({ stack: true }),
      winston.format.printf(info => {
        const { timestamp, level, message, ...rest } = info;
        const restString = Object.keys(rest).length ? JSON.stringify(rest, null, 2) : '';
        return `${timestamp} ${level.toUpperCase()}: ${message} ${restString}`;
      })
    );
  }
};

// Define transports with automatic daily rotation
const transports = [
  // Console transport with colors
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize({ all: true }),
      getFormat()
    ),
  })
];

// Add separate log files for different levels
transports.push(
    // Error logs
    new winston.transports.File({
      filename: path.join(LOG_DIR, 'error.log'),
      level: 'error',
      format: getFormat(),
      maxsize: 10485760, // 10MB
      maxFiles: 10,
    }),
    
    // HTTP request logs
    new winston.transports.File({
      filename: path.join(LOG_DIR, 'http.log'),
      level: 'http',
      format: getFormat(),
      maxsize: 10485760, // 10MB
      maxFiles: 10,
    }),
    
    // Combined logs (all levels)
    new winston.transports.File({
      filename: path.join(LOG_DIR, 'combined.log'),
      format: getFormat(),
      maxsize: 10485760, // 10MB
      maxFiles: 10,
    })
  );

// Create the logger
const logger = winston.createLogger({
  level: level(),
  levels,
  format: getFormat(),
  transports,
  exitOnError: false,
  // Add metadata to all logs
  defaultMeta: { 
    service: 'funfirstplay-api',
    environment: process.env.NODE_ENV,
    hostname: require('os').hostname()
  }
});

// Simple way to log startup banner
logger.logStartup = () => {
  logger.info('==================================');
  logger.info(`FunFirstPlay API Server`);
  logger.info(`Environment: ${process.env.NODE_ENV}`);
  logger.info(`Node.js: ${process.version}`);
  logger.info(`Log Level: ${level()}`);
  logger.info(`Domain: ${process.env.DOMAIN || 'funfirstplay.tech'}`);
  logger.info('==================================');
};

module.exports = logger;