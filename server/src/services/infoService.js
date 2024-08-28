const os = require('os');
const mongoose = require('mongoose');

exports.getSystemInfo = () => ({
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

exports.getDatabaseInfo = () => ({
  connected: mongoose.connection.readyState === 1,
  name: mongoose.connection.name,
  host: mongoose.connection.host,
  port: mongoose.connection.port,
  models: Object.keys(mongoose.models),
});

exports.getServerInfo = () => ({
  message: 'Server is running and connected to the database',
  serverInfo: {
    environment: process.env.NODE_ENV || 'development',
    ...exports.getSystemInfo(),
  },
  databaseInfo: exports.getDatabaseInfo(),
});

exports.getDatabaseStatus = () => {
  const status = mongoose.connection.readyState;
  const statusMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };
  return {
    status: statusMap[status],
    ...exports.getDatabaseInfo(),
  };
};

exports.getHealthCheck = async () => {
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
  return healthCheck;
};
