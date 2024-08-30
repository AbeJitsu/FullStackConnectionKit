// server/src/utils/middleware.js
const { corsMiddleware } = require('./corsConfig');

const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.message);
  console.error('Stack:', err.stack);

  const status = err.status || 500;
  const message =
    process.env.NODE_ENV === 'production'
      ? 'An unexpected error occurred'
      : err.message;

  res.status(status).json({
    error: 'Internal Server Error',
    message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
};

const applyMiddleware = (handler) => async (req, res, next) => {
  try {
    await new Promise((resolve) => corsMiddleware(req, res, resolve));
    await handler(req, res, next);
  } catch (error) {
    errorHandler(error, req, res, next);
  }
};

// New function to apply middleware to Express app
const setupMiddleware = (app) => {
  app.use(corsMiddleware);
  app.use((err, req, res, next) => errorHandler(err, req, res, next));
};

module.exports = { applyMiddleware, setupMiddleware, errorHandler };
