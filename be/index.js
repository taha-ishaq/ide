const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

// Create Express app and HTTP server
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  path: '/api/socket.io', // Use a specific path for Socket.IO if needed
  cors: {
    origin: '*', // Adjust to your needs
  },
});

// Use CORS middleware
app.use(cors());

// Store sessions and clients
const sessions = {};

io.on('connection', (socket) => {
  let currentSessionId = null;

  socket.on('join', (sessionId) => {
    currentSessionId = sessionId;
    if (!sessions[currentSessionId]) {
      sessions[currentSessionId] = [];
    }
    sessions[currentSessionId].push(socket);

    socket.join(sessionId);
  });

  socket.on('codeUpdate', (data) => {
    const { sessionId, code } = data;
    if (sessions[sessionId]) {
      socket.to(sessionId).emit('codeUpdate', { code });
    }
  });

  socket.on('disconnect', () => {
    if (currentSessionId && sessions[currentSessionId]) {
      sessions[currentSessionId] = sessions[currentSessionId].filter(client => client !== socket);
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
  console.log('Socket.IO server is running on port 3001');
});
