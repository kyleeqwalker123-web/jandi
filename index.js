const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});
const path = require('path');

app.use(express.static(__dirname));

// Temporary storage for messages
let messageHistory = {}; 

io.on('connection', (socket) => {
  socket.on('join room', (room) => {
    socket.join(room);
    
    // Send previous messages to the user who just joined
    if (messageHistory[room]) {
      socket.emit('load history', messageHistory[room]);
    }
  });

  socket.on('chat message', (data) => {
    if (!messageHistory[data.room]) {
      messageHistory[data.room] = [];
    }
    // Add new message to memory
    messageHistory[data.room].push(data);
    
    // Limit to last 100 messages
    if (messageHistory[data.room].length > 100) {
      messageHistory[data.room].shift();
    }

    io.to(data.room).emit('chat message', data);
  });
});

const PORT = process.env.PORT || 10000;
http.listen(PORT, '0.0.0.0', () => {
  console.log('Server running');
});
