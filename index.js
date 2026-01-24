const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static(__dirname));
let roomHistory = {};

io.on('connection', (socket) => {
    socket.on('join', (data) => {
        socket.join(data.room);
        if (!roomHistory[data.room]) roomHistory[data.room] = [];
        socket.emit('load_history', roomHistory[data.room]);
    });

    socket.on('chat_msg', (data) => {
        if (roomHistory[data.room]) {
            roomHistory[data.room].push(data);
            if (roomHistory[data.room].length > 50) roomHistory[data.room].shift();
        }
        io.to(data.room).emit('chat_msg', data);
    });

    socket.on('video_change', (data) => io.to(data.room).emit('video_change', data.id));
    socket.on('video_action', (data) => socket.to(data.room).emit('video_action', data.action));
    socket.on('send_reaction', (data) => io.to(data.room).emit('receive_reaction', data.emoji));
    socket.on('sync_trivia', (data) => io.to(data.room).emit('receive_trivia', data));
    socket.on('reveal_trivia', (room) => io.to(room).emit('reveal_trivia'));
});

http.listen(process.env.PORT || 10000, '0.0.0.0');
