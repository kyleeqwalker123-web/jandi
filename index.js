const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, { cors: { origin: "*" } });

app.use(express.static(__dirname));
let messageHistory = {}; 

io.on('connection', (socket) => {
  socket.on('join room', (room) => {
    socket.join(room);
    if (messageHistory[room]) socket.emit('load history', messageHistory[room]);
  });

  socket.on('chat message', (data) => {
    if (!messageHistory[data.room]) messageHistory[data.room] = [];
    messageHistory[data.room].push(data);
    io.to(data.room).emit('chat message', data);
  });

  socket.on('typing', (data) => {
    socket.to(data.room).emit('user typing', data);
  });

  socket.on('play video', (data) => {
    io.to(data.room).emit('sync video', data.videoId);
  });

  socket.on('send location', (data) => {
    socket.to(data.room).emit('receive location', data);
  });

  socket.on('send buzz', (room) => {
    socket.to(room).emit('get buzzed');
  });
});

const PORT = process.env.PORT || 10000;
http.listen(PORT, '0.0.0.0', () => { console.log('Server running'); });
