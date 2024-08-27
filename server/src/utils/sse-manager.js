// server/src/utils/sse-manager.js

const clients = new Set();
const MAX_CLIENTS = 100; // Adjust as needed

const handleSSEConnection = (req, res) => {
  if (clients.size >= MAX_CLIENTS) {
    console.warn('Max SSE clients reached. Rejecting new connection.');
    res.status(503).end('Server is at capacity');
    return;
  }

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });

  const clientId = Date.now();
  const newClient = {
    id: clientId,
    res,
  };

  clients.add(newClient);
  console.log(`SSE client connected. Total clients: ${clients.size}`);

  req.on('close', () => {
    clients.delete(newClient);
    console.log(`SSE client disconnected. Total clients: ${clients.size}`);
  });

  // Send initial connection message
  sendSSEUpdate(res, 'connected', { message: 'SSE connection established' });
  console.log(`SSE client connected. Total clients: ${clients.size}`);
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
