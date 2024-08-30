// server/api/index.js

const { createApp } = require('../src/serverConfig');
const { connectToDatabase } = require('../src/db/mongoose');
const { handleSSEConnection } = require('../src/utils/sse-manager');
const { applyMiddleware } = require('../src/utils/middleware');

const app = createApp();

// Initialize database connection
connectToDatabase();

// Unified handler for both Vercel and local environments
const handler = async (req, res) => {
  // Handle SSE requests
  if (req.url === '/api/sse') {
    return handleSSEConnection(req, res);
  }

  // For all other requests, use the Express app
  return app(req, res);
};

// Apply middleware and error handling
const wrappedHandler = applyMiddleware(handler);

// Export the wrapped handler
module.exports = wrappedHandler;
