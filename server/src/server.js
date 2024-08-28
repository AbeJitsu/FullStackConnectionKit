const express = require('express');
const http = require('http');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./db/mongoose');
const infoRoutes = require('./routes/infoRoutes');
const itemRoutes = require('./routes/itemRoutes');
const sseRoute = require('./routes/sseRoute');
const counterRoutes = require('./routes/counterRoutes');
const counterOperations = require('../api/counter-operations');
const errorHandler = require('./middleware/errorHandler');
const { corsConfig, validateCorsSetup } = require('./utils/corsConfig');

const app = express();

// Validate CORS setup
validateCorsSetup();

// Apply CORS middleware
const corsMiddleware =
  process.env.NODE_ENV === 'development'
    ? cors({ origin: 'http://localhost:8080', credentials: true })
    : cors(corsConfig);

app.use(corsMiddleware);
app.options('*', corsMiddleware);

// Debug logging middleware
const logRequest = (req, res, next) => {
  console.log(`Incoming request:`, {
    method: req.method,
    url: req.url,
    origin: req.headers.origin,
    'user-agent': req.headers['user-agent'],
  });
  next();
};

app.use(logRequest);

// Middleware
app.use(express.json());

// Database connection middleware
const connectDatabase = async (req, res, next) => {
  if (!global.mongoose) {
    global.mongoose = await connectDB();
  }
  next();
};

app.use(connectDatabase);

// Routes
const apiRoutes = {
  '/api/info': infoRoutes,
  '/api/items': itemRoutes,
  '/api/sse': sseRoute,
  '/api/counter-operations':
    process.env.NODE_ENV === 'production' ? counterOperations : counterRoutes,
};

Object.entries(apiRoutes).forEach(([path, router]) => {
  app.use(path, router);
});

// Additional routes
const additionalRoutes = {
  '/api/info/database-status': (req, res) => res.json({ status: 'connected' }),
  '/api/cors-test': {
    get: (req, res) => res.json({ message: 'CORS GET request successful' }),
    post: (req, res) => res.json({ message: 'CORS POST request successful' }),
  },
};

Object.entries(additionalRoutes).forEach(([path, handler]) => {
  if (typeof handler === 'function') {
    app.get(path, handler);
  } else {
    Object.entries(handler).forEach(([method, func]) => {
      app[method](path, func);
    });
  }
});

// Error handling middleware
app.use(errorHandler);

// Serverless-compatible handler
const serverlessHandler = async (req, res) => {
  await new Promise((resolve) => corsMiddleware(req, res, resolve));
  await app(req, res);
};

// Start server if not in a serverless environment
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  const server = http.createServer(app);

  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`SSE endpoint available at http://localhost:${PORT}/api/sse`);
  });
}

module.exports = process.env.VERCEL ? serverlessHandler : app;
