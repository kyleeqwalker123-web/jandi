const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, { cors: { origin: "*" } });
const path = require('path');

app.use(express.static(__dirname));
let messageHistory = {}; 
let roomMoods = {}; 

io.on('connection', (socket) => {
  socket.on('join room', (room) => {
    socket.join(room);
    if (messageHistory[room]) socket.emit('load history', messageHistory[room]);
    if (roomMoods[room]) io.to(room).emit('update mood', roomMoods[room]);
  });

  socket.on('chat message', (data) => {
    if (!messageHistory[data.room]) messageHistory[data.room] = [];
    messageHistory[data.room].push(data);
    io.to(data.room).emit('chat message', data);
  });

  // MOOD LOGIC
  socket.on('change mood', (data) => {
    roomMoods[data.room] = data.mood;
    io.to(data.room).emit('update mood', data.mood);
  });

  // BUZZ LOGIC
  socket.on('send buzz', (room) => {
    socket.to(room).emit('get buzzed');
  });
});

const PORT = process.env.PORT || 10000;
http.listen(PORT, '0.0.0.0', () => { console.log('Server running'); });
