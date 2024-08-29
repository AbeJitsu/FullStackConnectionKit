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

    // Use req.url directly, as Vercel strips the /api prefix
    const path = req.url;

    if (path === '/info/database-status') {
      res.json(infoService.getDatabaseStatus());
    } else if (path === '/info/health') {
      const healthCheck = await infoService.getHealthCheck();
      res.json(healthCheck);
    } else if (path === '/info') {
      res.json(infoService.getServerInfo());
    } else {
      res.status(404).json({ error: 'Not found' });
    }
  } catch (error) {
    console.error('Info route error:', error);
    res
      .status(500)
      .json({ message: 'Internal server error', error: error.message });
  }
};
