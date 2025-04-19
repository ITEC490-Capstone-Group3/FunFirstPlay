const jwt = require('jsonwebtoken');
const { errorResponse } = require('../utils/apiResponse');
const logger = require('../utils/logger');

/**
 * Authentication middleware to verify JWT tokens
 */
const auth = (req, res, next) => {
  try {
    // Get token from authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 401, 'Access denied. No token provided.');
    }
    
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return errorResponse(res, 401, 'Access denied. No token provided.');
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ['HS256'], // Only allow specific algorithm
      maxAge: process.env.JWT_EXPIRY || '24h' // Set maximum token age
    });
    
    // Check token type to prevent token substitution attacks
    if (decoded.type !== 'access') {
      return errorResponse(res, 401, 'Invalid token type.');
    }

    // Add user from payload to request
    req.user = decoded;
    
    // Log authentication (debug level only for privacy)
    logger.debug(`Authenticated user ID ${decoded.userId}`);
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return errorResponse(res, 401, 'Invalid token.');
    } else if (error.name === 'TokenExpiredError') {
      return errorResponse(res, 401, 'Token expired.');
    } else if (error.name === 'NotBeforeError') {
      return errorResponse(res, 401, 'Token not active yet.');
    } else {
      logger.error(`Authentication error: ${error.message}`);
      return errorResponse(res, 500, 'Authentication error.');
    }
  }
};

/**
 * Role-based authorization middleware
 * @param {Array} allowedRoles - Array of roles allowed to access the route
 */
const authorize = (allowedRoles) => {
  return (req, res, next) => {
    // Auth middleware must run first to set req.user
    if (!req.user) {
      return errorResponse(res, 401, 'Authentication required');
    }

    // Check if user role is in the allowed roles
    if (!allowedRoles.includes(req.user.role)) {
      logger.warn(`Authorization failed: User ${req.user.userId} with role ${req.user.role} attempted to access restricted resource`);
      return errorResponse(res, 403, 'Access denied. Insufficient permissions.');
    }

    next();
  };
};

module.exports = {
  auth,
  authorize
};