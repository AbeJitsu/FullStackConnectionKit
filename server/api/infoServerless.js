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

    // Log the request details for debugging
    console.log('Request URL:', req.url);
    console.log('Request method:', req.method);

    // Extract the path from the URL
    const path = new URL(req.url, `http://${req.headers.host}`).pathname;

    // Log the extracted path
    console.log('Extracted path:', path);

    if (path === '/api/info/database-status') {
      res.json(infoService.getDatabaseStatus());
    } else if (path === '/api/info/health') {
      const healthCheck = await infoService.getHealthCheck();
      res.json(healthCheck);
    } else if (path === '/api/info') {
      res.json(infoService.getServerInfo());
    } else {
      res.status(404).json({ error: 'Not found', path: path });
    }
  } catch (error) {
    console.error('Info route error:', error);
    res
      .status(500)
      .json({ message: 'Internal server error', error: error.message });
  }
};
