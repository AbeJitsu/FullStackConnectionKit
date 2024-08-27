// api/info.js
const mongoose = require('mongoose');
const os = require('os');
const connectDB = require('../src/db/mongoose');

let isConnected = false;

const connectToDatabase = async () => {
  if (isConnected) return;
  await connectDB();
  isConnected = true;
};

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

const getDatabaseInfo = () => ({
  connected: mongoose.connection.readyState === 1,
  name: mongoose.connection.name,
  host: mongoose.connection.host,
  port: mongoose.connection.port,
  models: Object.keys(mongoose.models),
});

module.exports = async (req, res) => {
  try {
    await connectToDatabase();

    const path = req.url;

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
  } catch (error) {
    console.error('Info route error:', error);
    res
      .status(500)
      .json({ message: 'Internal server error', error: error.message });
  }
};
