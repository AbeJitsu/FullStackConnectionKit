// api/infoServerless.js

const connectDB = require('../src/db/mongoose');
const infoService = require('../src/services/infoService');

let isConnected = false;

const connectToDatabase = async () => {
  if (isConnected) return;
  await connectDB();
  isConnected = true;
};

module.exports = async (req, res) => {
  try {
    await connectToDatabase();

    const path = req.url;

    switch (path) {
      case '/api/info':
        res.json(infoService.getServerInfo());
        break;
      case '/api/info/database-status':
        res.json(infoService.getDatabaseStatus());
        break;
      case '/api/info/health':
        const healthCheck = await infoService.getHealthCheck();
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
