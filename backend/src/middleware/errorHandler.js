const logger = require('../utils/logger');

/**
 * Global error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  // Log the error
  logger.error(`${err.name}: ${err.message}\nStack: ${err.stack}`);

  // Set default status code and message
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = err.errors || null;

  // Handle specific error types
  switch (err.name) {
    case 'ValidationError':
      statusCode = 400;
      message = 'Validation Error';
      errors = formatValidationErrors(err);
      break;
      
    case 'JsonWebTokenError':
    case 'TokenExpiredError':
    case 'NotBeforeError':
      statusCode = 401;
      message = 'Authentication Error';
      break;
      
    case 'ForbiddenError':
      statusCode = 403;
      message = 'Access Denied';
      break;
      
    case 'NotFoundError':
      statusCode = 404;
      message = 'Resource Not Found';
      break;
      
    case 'ConflictError':
      statusCode = 409;
      message = 'Resource Conflict';
      break;
      
    case 'RateLimitError':
      statusCode = 429;
      message = 'Too Many Requests';
      break;
      
    default:
      // Hide detailed error for security
      message = 'Internal Server Error';
      errors = null;
  }

  // Send error response
  res.status(statusCode).json({
    status: 'error',
    message,
    errors,
    // Include request ID if present for tracing
    request_id: req.id
  });
};

/**
 * Format validation errors from various sources
 */
const formatValidationErrors = (err) => {
  const formattedErrors = {};

  // Handle Joi validation errors
  if (err.details && Array.isArray(err.details)) {
    err.details.forEach(detail => {
      formattedErrors[detail.path] = detail.message;
    });
    return formattedErrors;
  }

  // Handle Mongoose validation errors
  if (err.errors) {
    Object.keys(err.errors).forEach(key => {
      formattedErrors[key] = err.errors[key].message;
    });
    return formattedErrors;
  }

  // Handle other validation errors
  return err.errors || { general: err.message };
};

module.exports = errorHandler;