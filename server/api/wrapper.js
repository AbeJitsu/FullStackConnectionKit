// server/api/wrapper.js
const { applyMiddleware } = require('../src/utils/middleware');
const connectDB = require('../src/db/mongoose');

const createHandler = (handler) => {
  return applyMiddleware(async (req, res) => {
    try {
      // Ensure database connection
      await connectDB();

      // Your serverless function logic here
      await handler(req, res);
    } catch (error) {
      console.error('Error in serverless function:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    } finally {
      // If we're in a serverless environment, we might want to close the connection
      // This depends on your specific use case and database connection strategy
      // if (process.env.VERCEL) {
      //   await mongoose.connection.close();
      // }
    }
  });
};

// New function to create a handler for SSE
const createSSEHandler = (handler) => {
  return applyMiddleware(async (req, res) => {
    try {
      // Ensure database connection
      await connectDB();

      // Set headers for SSE
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no',
      });

      // Flush headers immediately
      res.flushHeaders();

      // Your SSE handler logic here
      await handler(req, res);
    } catch (error) {
      console.error('Error in SSE handler:', error);
      res.write(
        `event: error\ndata: ${JSON.stringify({
          message: 'Internal Server Error',
        })}\n\n`
      );
    }
  });
};

module.exports = { createHandler, createSSEHandler };
