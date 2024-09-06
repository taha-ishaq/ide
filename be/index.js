const express = require('express');
const http = require('http');
const WebSocket = require('ws');

// Create Express app and HTTP server
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Store clients
let clients = {};

// Handle new connections
wss.on('connection', (ws) => {
  const clientId = Date.now(); // unique client ID based on timestamp
  clients[clientId] = ws;

  ws.on('message', (message) => {
    const data = JSON.parse(message);

    // Broadcast message to all other clients except sender
    Object.keys(clients).forEach((id) => {
      if (id !== clientId.toString()) {
        clients[id].send(JSON.stringify(data));
      }
    });
  });

  ws.on('close', () => {
    delete clients[clientId]; // Remove client on disconnection
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
