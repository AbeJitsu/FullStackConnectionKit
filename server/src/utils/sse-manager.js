// server/src/utils/sse-manager.js

const MAX_CLIENTS = 100; // Adjust as needed

// Use a more persistent storage for serverless environment
let clients = new Set();

// Add this function to handle serverless limitations
const cleanupOldConnections = () => {
  const now = Date.now();
  clients.forEach((client) => {
    if (now - client.connectedAt > 30000) {
      // 30 seconds timeout
      clients.delete(client);
    }
  });
};

const handleSSEConnection = (req, res) => {
  cleanupOldConnections();

  if (clients.size >= MAX_CLIENTS) {
    console.warn('Max SSE clients reached. Rejecting new connection.');
    res.status(503).end('Server is at capacity');
    return;
  }

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no', // Disable buffering for Nginx
  });

  const clientId = Date.now();
  const newClient = {
    id: clientId,
    res,
    connectedAt: Date.now(),
  };

  clients.add(newClient);
  console.log(`SSE client connected. Total clients: ${clients.size}`);

  req.on('close', () => {
    clients.delete(newClient);
    console.log(`SSE client disconnected. Total clients: ${clients.size}`);
  });

  // Send initial connection message
  sendSSEUpdate(res, 'connected', { message: 'SSE connection established' });

  // Keep the connection alive
  const keepAlive = setInterval(() => {
    sendSSEUpdate(res, 'keepalive', {});
  }, 15000); // Send keepalive every 15 seconds

  req.on('close', () => {
    clearInterval(keepAlive);
  });
};

const sendSSEUpdate = (res, event, data) => {
  if (res && typeof res.write === 'function') {
    res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  } else {
    console.error('Invalid response object in sendSSEUpdate');
  }
};

const broadcastSSEUpdate = (event, data) => {
  console.log(
    `Broadcasting SSE update. Event: ${event}, Clients: ${clients.size}`
  );
  clients.forEach((client) => {
    try {
      sendSSEUpdate(client.res, event, data);
    } catch (error) {
      console.error(`Error broadcasting to client ${client.id}:`, error);
      clients.delete(client);
    }
  });
};

module.exports = {
  handleSSEConnection,
  sendSSEUpdate,
  broadcastSSEUpdate,
};
