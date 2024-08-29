const express = require('express');
const http = require('http');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./db/mongoose');
const infoRoutes = require('./routes/infoRoutes');
const itemRoutes = require('./routes/itemRoutes');
const sseRoute = require('./routes/sseRoute');
const counterRoutes = require('./routes/counterRoutes');
const corsTestRoute = require('./routes/corsTestRoute');
const counterOperations = require('../api/counter-operations');
const errorHandler = require('./middleware/errorHandler');
const { corsConfig, validateCorsSetup } = require('./utils/corsConfig');
const { applyMiddleware } = require('./utils/middleware');

const app = express();

// Validate CORS setup
validateCorsSetup();

// Apply CORS middleware
const corsMiddleware = cors(
  process.env.NODE_ENV === 'development'
    ? { origin: 'http://localhost:8080', credentials: true }
    : corsConfig
);

app.use(corsMiddleware);
app.options('*', corsMiddleware);

// Add JSON parsing middleware
app.use(express.json());

// Apply common middleware
applyMiddleware(app);

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

// Serverless-compatible handler
const serverlessHandler = async (req, res) => {
  await new Promise((resolve) => corsMiddleware(req, res, resolve));
  await app(req, res);
};

// Start server if this file is run directly
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  const server = http.createServer(app);

  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`SSE endpoint available at http://localhost:${PORT}/api/sse`);
  });
}

// Export the serverless handler for Vercel, otherwise export the app
module.exports = process.env.VERCEL ? serverlessHandler : app;
