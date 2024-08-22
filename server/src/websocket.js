const WebSocket = require('ws');

function setupWebSocket(server) {
  const wss = new WebSocket.Server({
    server,
    verifyClient: (info, callback) => {
      const origin = info.origin;
      const allowedOrigins = [
        process.env.SERVER_CLOUD_FRONTEND_URL,
        process.env.SERVER_LOCAL_FRONTEND_URL,
      ];

      if (allowedOrigins.includes(origin)) {
        callback(true);
      } else {
        console.log(`WebSocket connection rejected from origin: ${origin}`);
        callback(false, 403, 'Origin not allowed');
      }
    },
  });

  wss.on('connection', (ws, req) => {
    console.log(
      'New WebSocket connection established from:',
      req.headers.origin
    );

    ws.on('message', (message) => {
      console.log('Received message:', message);
      ws.send(`Echo: ${message}`);
    });

    ws.send('WebSocket connection established');
  });

  return wss;
}

module.exports = setupWebSocket;
