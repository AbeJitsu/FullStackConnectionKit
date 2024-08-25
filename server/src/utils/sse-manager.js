// server/src/utils/sse-manager.js

const clients = new Set();

const handleSSEConnection = (req, res) => {
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

  req.on('close', () => {
    clients.delete(newClient);
  });

  // Send initial connection message
  sendSSEUpdate(res, 'connected', { message: 'SSE connection established' });
};

const sendSSEUpdate = (res, event, data) => {
  res.write(`event: ${event}\n`);
  res.write(`data: ${JSON.stringify(data)}\n\n`);
};

const broadcastSSEUpdate = (event, data) => {
  clients.forEach((client) => {
    sendSSEUpdate(client.res, event, data);
  });
};

module.exports = {
  handleSSEConnection,
  sendSSEUpdate,
  broadcastSSEUpdate,
};
