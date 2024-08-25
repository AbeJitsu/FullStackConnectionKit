// api/info.js
const express = require('express');
const mongoose = require('mongoose');
const os = require('os');
const connectDB = require('../server/src/db/mongoose');
const { handleCors } = require('../server/src/utils/corsConfig');

// Helper function to get system info
const getSystemInfo = () => ({
  nodeVersion: process.version,
  platform: process.platform,
  arch: process.arch,
  cpus: os.cpus().length,
  memory: {
    total: `${Math.round(os.totalmem() / (1024 * 1024 * 1024))} GB`,
    free: `${Math.round(os.freemem() / (1024 * 1024 * 1024))} GB`,
    usage: `${Math.round((1 - os.freemem() / os.totalmem()) * 100)}%`,
  },
  uptime: {
    server: `${Math.floor(process.uptime())} seconds`,
    system: `${Math.floor(os.uptime())} seconds`,
  },
});

// Helper function to get database info
const getDatabaseInfo = () => ({
  connected: mongoose.connection.readyState === 1,
  name: mongoose.connection.name,
  host: mongoose.connection.host,
  port: mongoose.connection.port,
  models: Object.keys(mongoose.models),
});

// Main handler function
const infoHandler = async (req, res) => {
  await connectDB();

  const path = req.path || req.url; // Use req.url for serverless, req.path for Express

  console.log('Received request for info route:', {
    path,
    origin: req.headers.origin,
    method: req.method,
  });

  switch (path) {
    case '/api/info':
      const serverInfo = {
        message: 'Server is running and connected to the database',
        serverInfo: {
          environment: process.env.NODE_ENV || 'development',
          ...getSystemInfo(),
        },
        databaseInfo: getDatabaseInfo(),
      };
      res.json(serverInfo);
      break;

    case '/api/info/database-status':
      const status = mongoose.connection.readyState;
      const statusMap = {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting',
      };
      res.json({
        status: statusMap[status],
        ...getDatabaseInfo(),
      });
      break;

    case '/api/info/health':
      const healthCheck = {
        uptime: process.uptime(),
        responseTime: process.hrtime(),
        message: 'OK',
        timestamp: Date.now(),
      };
      try {
        await mongoose.connection.db.admin().ping();
        healthCheck.database = 'OK';
      } catch (error) {
        healthCheck.database = 'ERROR';
        healthCheck.message = 'ERROR';
      }
      res.json(healthCheck);
      break;

    default:
      res.status(404).json({ error: 'Not found' });
  }
};

// Express app setup
const app = express();
handleCors(app);
app.use(express.json());

// Express routes
app.get('/api/info', infoHandler);
app.get('/api/info/database-status', infoHandler);
app.get('/api/info/health', infoHandler);

// Serverless handler
const serverlessHandler = async (req, res) => {
  await infoHandler(req, res);
};

// Export both the Express app and the serverless handler
module.exports = process.env.VERCEL ? serverlessHandler : app;
