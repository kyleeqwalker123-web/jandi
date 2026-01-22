const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
  cors: {
    origin: "*", // This allows your phone and Mac to talk to each other
    methods: ["GET", "POST"]
  }
});
const path = require('path');

app.use(express.static(path.join(__dirname)));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

io.on('connection', (socket) => {
  console.log('User connected');
  
  socket.on('join room', (room) => {
    socket.join(room);
    console.log('User joined room: ' + room);
  });

  socket.on('chat message', (data) => {
    // This sends the message to EVERYONE in the room
    io.to(data.room).emit('chat message', data);
  });
});

const PORT = process.env.PORT || 10000;
http.listen(PORT, () => {
  console.log('Server is running on port ' + PORT);
});
