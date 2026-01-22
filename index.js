const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

io.on('connection', (socket) => {
  socket.on('join room', (room) => socket.join(room));
  socket.on('chat message', (data) => io.to(data.room).emit('chat message', data));
  socket.on('react', (data) => io.to(data.room).emit('react', data));
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => console.log('Server online on port ' + PORT));
