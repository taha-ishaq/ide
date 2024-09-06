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
let sessions = {};

// Handle new connections
wss.on('connection', (ws) => {
  let sessionId = null;

  ws.on('message', (message) => {
    const data = JSON.parse(message);
    
    if (data.type === 'join') {
      // Join a session
      sessionId = data.sessionId;
      if (!sessions[sessionId]) {
        sessions[sessionId] = [];
      }
      sessions[sessionId].push(ws);
    } else if (data.type === 'codeUpdate' && sessionId) {
      // Broadcast code updates to all clients in the same session
      sessions[sessionId].forEach(client => {
        if (client !== ws) {
          client.send(JSON.stringify({ type: 'codeUpdate', code: data.code }));
        }
      });
    }
  });

  ws.on('close', () => {
    if (sessionId) {
      // Remove client from session on disconnection
      sessions[sessionId] = sessions[sessionId].filter(client => client !== ws);
      if (sessions[sessionId].length === 0) {
        delete sessions[sessionId]; // Remove session if no clients are left
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
