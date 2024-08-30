// server/src/server.js

const http = require('http');
require('dotenv').config();
const { createApp } = require('./serverConfig');

const app = createApp();

// Start server if this file is run directly
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  const server = http.createServer(app);

  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`SSE endpoint available at http://localhost:${PORT}/api/sse`);
  });
}

module.exports = app;
