const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, { cors: { origin: "*" }});

app.use(express.static(__dirname));

io.on('connection', (socket) => {
    let currentRoom = "";

    socket.on('join', (room) => {
        currentRoom = room;
        socket.join(room);
    });

    // Video Syncing
    socket.on('video_change', (data) => io.to(data.room).emit('video_change', data.id));
    socket.on('video_action', (data) => socket.to(data.room).emit('video_action', data.action));
    
    // Emoji Reactions
    socket.on('send_reaction', (data) => io.to(data.room).emit('receive_reaction', data.emoji));

    // Trivia Syncing
    socket.on('sync_trivia', (data) => io.to(data.room).emit('receive_trivia', data));
    socket.on('reveal_trivia', (room) => io.to(room).emit('reveal_trivia'));
});

const PORT = process.env.PORT || 10000;
http.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
