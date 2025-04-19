const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
require('dotenv').config();

// Import routes
const userRoutes = require('./routes/userRoutes');
const sportRoutes = require('./routes/sportRoutes');
const skillLevelRoutes = require('./routes/skillLevelRoutes');
const availabilityRoutes = require('./routes/availabilityRoutes');
const matchRoutes = require('./routes/matchRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const authRoutes = require('./routes/authRoutes');
const sessionRoutes = require('./routes/sessionRoutes');

// Import middlewares
const errorHandler = require('./middleware/errorHandler');
const logger = require('./utils/logger');

const app = express();

// Needed when behind a reverse proxy like Nginx
if (process.env.TRUST_PROXY === 'true') {
  app.set('trust proxy', 1);
  logger.info('Proxy trust enabled');
}

// Security middleware with configuration for production API
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: ["'self'", 'https://funfirstplay.tech'],
      imgSrc: ["'self'", 'data:'],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: []
    }
  },
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  crossOriginOpenerPolicy: { policy: 'same-origin' },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
}));

// CORS configuration - Since frontend and API are on the same domain, 
const corsOptions = {
  origin: process.env.CORS_ORIGIN ? 
    process.env.CORS_ORIGIN.split(',') : 
    ['http://localhost:3000', 'https://funfirstplay.tech', 'https://www.funfirstplay.tech'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400 // 24 hours
};
app.use(cors(corsOptions));

// Rate limiting to prevent abuse
const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // default: 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // default: limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    status: 'error',
    message: 'Too many requests from this IP, please try again later.'
  }
});
app.use('/api/', apiLimiter);

// Body parsing
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Compression for better performance
app.use(compression());

// Request logging with Morgan (HTTP request logger)
app.use(morgan('combined', {
  stream: {
    write: message => logger.http(message.trim())
  }
}));

// Custom request logging for detailed information
app.use((req, res, next) => {
  const startTime = Date.now();
  
  // Log when response is finished
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    logger.debug(
      `${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms | IP: ${req.ip}`
    );
  });
  
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/sports', sportRoutes);
app.use('/api/skill-levels', skillLevelRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/sessions', sessionRoutes);

// API health check with more detailed information
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date(),
    environment: process.env.NODE_ENV,
    domain: process.env.DOMAIN || 'funfirstplay.tech',
    version: process.env.npm_package_version || '1.0.0',
    uptime: Math.floor(process.uptime()) + ' seconds',
    memory: process.memoryUsage(),
    nodejs: process.version
  });
});

// Redirect root to API documentation or health check
app.get('/', (req, res) => {
  res.redirect('/api/health');
});

// Error handling
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Resource not found',
    path: req.originalUrl
  });
});

module.exports = app;
