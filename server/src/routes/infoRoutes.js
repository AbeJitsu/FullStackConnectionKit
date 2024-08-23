// server/src/routes/infoRoutes.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const os = require('os');

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
  network: Object.values(os.networkInterfaces())
    .flat()
    .filter(({ family, internal }) => family === 'IPv4' && !internal)
    .map(({ address }) => address),
});

// Helper function to get database info
const getDatabaseInfo = () => ({
  connected: mongoose.connection.readyState === 1,
  uri: process.env.SERVER_LOCAL_DATABASE_URL
    ? 'Connected (URI masked for security)'
    : 'Not provided',
  name: mongoose.connection.name,
  host: mongoose.connection.host,
  port: mongoose.connection.port,
  models: Object.keys(mongoose.models),
});

// Async handler wrapper with logging
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next))
    .catch(next)
    .finally(() => {
      console.log(`${req.method} request to ${req.originalUrl}`, {
        origin: req.headers.origin,
        'user-agent': req.headers['user-agent'],
      });
    });

// Main info route
router.get(
  '/',
  asyncHandler(async (req, res) => {
    console.log('Received request for main info route:', {
      origin: req.headers.origin,
      method: req.method,
    });
    const serverInfo = {
      message: 'Server is running and connected to the database',
      serverInfo: {
        port: process.env.PORT || 3000,
        environment: process.env.NODE_ENV || 'development',
        ...getSystemInfo(),
      },
      databaseInfo: getDatabaseInfo(),
    };
    res.json(serverInfo);
  })
);

// Database status route
router.get(
  '/database-status',
  asyncHandler(async (req, res) => {
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
  })
);

// System health check route
router.get(
  '/health',
  asyncHandler(async (req, res) => {
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
  })
);

// Environment variables route (be cautious with this in production)
router.get(
  '/env',
  asyncHandler(async (req, res) => {
    if (process.env.NODE_ENV === 'production') {
      return res
        .status(403)
        .json({ message: 'Access forbidden in production mode' });
    }
    res.json(process.env);
  })
);

module.exports = router;
