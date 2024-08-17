const express = require('express');
const http = require('http');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./db/mongoose');
const setupWebSocket = require('./websocket');
const infoRoutes = require('./routes/infoRoutes');
const itemRoutes = require('./routes/itemRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 3000;

// Connect to the database
connectDB();

// Middleware
const corsOptions = {
  origin:
    process.env.NODE_ENV === 'production'
      ? process.env.SERVER_CLOUD_FRONTEND_URL
      : 'http://localhost:8080',
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(express.json());

// Routes
app.use('/api/info', infoRoutes);
app.use('/api/items', itemRoutes);

// Add missing routes
app.get('/api/info/database-status', (req, res) => {
  res.json({ status: 'connected' });
});

app.get('/api/cors-test', (req, res) => {
  res.json({ message: 'CORS GET request successful' });
});

app.post('/api/cors-test', (req, res) => {
  res.json({ message: 'CORS POST request successful' });
});

// Setup WebSocket using the imported module
const wss = setupWebSocket(server);

// Error handling middleware
app.use(errorHandler);

// Start server
const startServer = () => {
  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`WebSocket server is running on ws://localhost:${PORT}`);
  });
};

startServer();

module.exports = { app, server }; // For testing purposes
