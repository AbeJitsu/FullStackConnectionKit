const WebSocket = require('ws');

function setupWebSocket(server) {
  const wss = new WebSocket.Server({ server });

  wss.on('connection', (ws) => {
    console.log('New WebSocket connection established');

    ws.on('message', (message) => {
      console.log('Received message:', message);
      ws.send(`Echo: ${message}`);
    });

    ws.send('WebSocket connection established');
  });

  return wss;
}

module.exports = setupWebSocket;
