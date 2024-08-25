// api/sse.js
const { handleSSEConnection } = require('../server/src/utils/sse-manager');
const { connectToDatabase } = require('../server/src/db/mongoose');

module.exports = async (req, res) => {
  try {
    // Ensure database connection is established
    await connectToDatabase();

    // Set headers for SSE
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable buffering for Nginx
    });

    // Flush headers immediately
    res.flushHeaders();

    // Handle SSE connection
    await handleSSEConnection(req, res);
  } catch (error) {
    console.error('SSE Error:', error);
    res
      .status(500)
      .json({ error: 'Internal Server Error', message: error.message });
  }
};
