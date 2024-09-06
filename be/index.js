const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');

// Create Express app and HTTP server
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Use CORS middleware
app.use(cors());

// Store sessions and clients
const sessions = {};

wss.on('connection', (ws) => {
  let currentSessionId = null;

  ws.on('message', (message) => {
    const data = JSON.parse(message);

    switch (data.type) {
      case 'join':
        currentSessionId = data.sessionId;
        if (!sessions[currentSessionId]) {
          sessions[currentSessionId] = [];
        }
        sessions[currentSessionId].push(ws);
        break;

      case 'codeUpdate':
        const clients = sessions[data.sessionId];
        if (clients) {
          clients.forEach(client => {
            if (client !== ws) {
              client.send(JSON.stringify({
                type: 'codeUpdate',
                code: data.code
              }));
            }
          });
        }
        break;
    }
  });

  ws.on('close', () => {
    if (currentSessionId && sessions[currentSessionId]) {
      sessions[currentSessionId] = sessions[currentSessionId].filter(client => client !== ws);
      if (sessions[currentSessionId].length === 0) {
        delete sessions[currentSessionId];
      }
    }
  });
});

// Define a simple route for testing
app.get("/", (req, res) => {
  res.send("Hello world");
});

// Start the server
server.listen(3001, () => {
  console.log('WebSocket server is running on port 3001');
});
