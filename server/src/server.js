const express = require('express');
const http = require('http');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./db/mongoose');
const setupWebSocket = require('./websocket');
const infoRoutes = require('./routes/infoRoutes');
const itemRoutes = require('./routes/itemRoutes');
const corsTestRoute = require('./routes/corsTestRoute');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 3000;

// Connect to the database
connectDB();

// Middleware
const corsOptions = {
  origin: process.env.CLIENT_URL || 'http://localhost:8080',
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(express.json());

// Routes
app.use('/api/info', infoRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/cors-test', corsTestRoute);

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
// server/src/server.js
