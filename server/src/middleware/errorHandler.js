const { v4: uuidv4 } = require('uuid');
const logger = console;

const errorHandler = (err, req, res, next) => {
  const errorId = uuidv4();

  // Log the error with the unique identifier and request details
  logger.error(`Error ID ${errorId}:`, {
    error: err,
    method: req.method,
    url: req.url,
    origin: req.headers.origin,
    'user-agent': req.headers['user-agent'],
  });

  // Set default values
  let status = err.status || 500;
  let message =
    process.env.NODE_ENV === 'production'
      ? 'An unexpected error occurred'
      : err.message || 'An unexpected error occurred';
  let errorCode = err.code || 'INTERNAL_SERVER_ERROR';

  // Handle specific error types
  if (err.name === 'ValidationError') {
    status = 400;
    message =
      process.env.NODE_ENV === 'production'
        ? 'Validation error'
        : Object.values(err.errors)
            .map((val) => val.message)
            .join(', ');
    errorCode = 'VALIDATION_ERROR';
  } else if (err.name === 'CastError') {
    status = 400;
    message = 'Invalid input';
    errorCode = 'INVALID_INPUT';
  } else if (err.code === 11000) {
    status = 409;
    message = 'Duplicate entry';
    errorCode = 'DUPLICATE_ENTRY';
  } else if (err.message === 'Not allowed by CORS') {
    status = 403;
    message = 'CORS error: Origin not allowed';
    errorCode = 'CORS_ERROR';
  }

  // Prepare the error response
  const errorResponse = {
    status: 'error',
    errorCode,
    message,
    errorId,
    timestamp: new Date().toISOString(),
  };

  // Include additional information in development environment
  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = err.stack;
    if (err.message !== message) {
      errorResponse.originalError = err.message;
    }
  }

  // Send the error response
  res.status(status).json(errorResponse);
};

module.exports = errorHandler;
