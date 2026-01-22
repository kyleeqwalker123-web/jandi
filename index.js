const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, { cors: { origin: "*" } });

app.use(express.static(__dirname));

let roomData = {};

io.on('connection', (socket) => {
  socket.on('join room', (room) => {
    socket.join(room);
    if (!roomData[room]) {
      roomData[room] = { messages: [], currentVideo: null };
    }
    // Send history and video state to the user joining
    if (roomData[room].messages.length > 0) socket.emit('load history', roomData[room].messages);
    if (roomData[room].currentVideo) socket.emit('sync video', roomData[room].currentVideo);
  });

  socket.on('chat message', (data) => {
    if (roomData[data.room]) {
      roomData[data.room].messages.push(data);
      if (roomData[data.room].messages.length > 50) roomData[data.room].messages.shift();
    }
    io.to(data.room).emit('chat message', data);
  });

  socket.on('play video', (data) => {
    if (roomData[data.room]) roomData[data.room].currentVideo = data.videoId;
    io.to(data.room).emit('sync video', data.videoId);
  });

  socket.on('yt_control', (data) => {
    io.to(data.room).emit('yt_action', data);
  });

  socket.on('send location', (data) => {
    socket.to(data.room).emit('receive location', data);
  });

  socket.on('send buzz', (room) => {
    io.to(room).emit('get buzzed');
  });
});

const PORT = process.env.PORT || 10000;
http.listen(PORT, '0.0.0.0', () => { console.log('Server running'); });
