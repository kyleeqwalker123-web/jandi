const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});
const path = require('path');

app.use(express.static(__dirname));

io.on('connection', (socket) => {
  console.log('A user connected: ' + socket.id);

  socket.on('join room', (room) => {
    socket.join(room);
    console.log(`User ${socket.id} joined room: ${room}`);
  });

  socket.on('chat message', (data) => {
    console.log(`Message received for room ${data.room}: ${data.msg}`);
    // This line sends it to everyone INCLUDING the sender
    io.to(data.room).emit('chat message', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

const PORT = process.env.PORT || 10000;
http.listen(PORT, '0.0.0.0', () => {
  console.log('Server is running on port ' + PORT);
});
