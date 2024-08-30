// server/src/serverConfig.js

const express = require('express');
const cors = require('cors');
const { corsConfig, validateCorsSetup } = require('./utils/corsConfig');
const errorHandler = require('./middleware/errorHandler');
const { applyMiddleware } = require('./utils/middleware');

const infoRoutes = require('./routes/infoRoutes');
const itemRoutes = require('./routes/itemRoutes');
const sseRoute = require('./routes/sseRoute');
const counterRoutes = require('./routes/counterRoutes');
const corsTestRoute = require('./routes/corsTestRoute');
const counterOperations = require('../api/counter-operations');

// Environment detection
const isVercel = process.env.VERCEL === '1';
const isProduction =
  process.env.NODE_ENV === 'production' ||
  (isVercel && process.env.VERCEL_ENV === 'production');

function createApp() {
  const app = express();

  // Validate CORS setup
  validateCorsSetup();

  // Apply CORS middleware
  const corsMiddleware = cors(corsConfig);
  app.use(corsMiddleware);
  app.options('*', corsMiddleware);

  // Add JSON parsing middleware
  app.use(express.json());

  // Apply common middleware
  applyMiddleware(app);

  // Apply routes
  const apiRoutes = {
    '/api/info': infoRoutes,
    '/api/items': itemRoutes,
    '/api/sse': sseRoute,
    '/api/counter-operations': isProduction ? counterOperations : counterRoutes,
    '/api/cors-test': corsTestRoute,
  };

  Object.entries(apiRoutes).forEach(([path, router]) => {
    app.use(path, router);
  });

  // Additional routes
  app.get('/api/info/database-status', (req, res) =>
    res.json({ status: 'connected' })
  );

  // Error handling middleware
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
