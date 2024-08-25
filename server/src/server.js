const express = require('express');
const http = require('http');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./db/mongoose');
const infoRoutes = require('./routes/infoRoutes');
const itemRoutes = require('./routes/itemRoutes');
const sseRoute = require('./routes/sseRoute');
const errorHandler = require('./middleware/errorHandler');
const { corsConfig, validateCorsSetup } = require('./utils/corsConfig');

const app = express();

// Validate CORS setup
validateCorsSetup();

// Apply CORS middleware
if (process.env.NODE_ENV === 'development') {
  app.use(cors({ origin: 'http://localhost:8080', credentials: true }));
} else {
  app.use(cors(corsConfig));
}
app.options('*', cors(corsConfig));

// Debug logging
app.use((req, res, next) => {
  console.log(`Incoming request:`, {
    method: req.method,
    url: req.url,
    origin: req.headers.origin,
    'user-agent': req.headers['user-agent'],
  });
  next();
});

// Middleware
app.use(express.json());

// Connect to the database
app.use(async (req, res, next) => {
  if (!global.mongoose) {
    global.mongoose = await connectDB();
  }
  next();
});

// Routes
app.use('/api/info', infoRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/sse', sseRoute);

// Additional routes
app.get('/api/info/database-status', (req, res) => {
  res.json({ status: 'connected' });
});

app.get('/api/cors-test', (req, res) => {
  res.json({ message: 'CORS GET request successful' });
});

app.post('/api/cors-test', (req, res) => {
  res.json({ message: 'CORS POST request successful' });
});

// Error handling middleware
app.use(errorHandler);

// Serverless-compatible handler
const serverlessHandler = async (req, res) => {
  await new Promise((resolve) => cors(corsConfig)(req, res, resolve));
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
