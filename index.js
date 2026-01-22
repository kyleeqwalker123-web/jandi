const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});
const path = require('path');

// Serve the static files (index.html, etc.)
app.use(express.static(__dirname));

// Store messages and current video state per room
let roomData = {};

io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('join room', (room) => {
        socket.join(room);
        console.log(`User joined room: ${room}`);

        // Initialize room if it doesn't exist
        if (!roomData[room]) {
            roomData[room] = {
                messages: [],
                currentVideo: null
            };
        }

        // Send history and current video to the person who just joined
        if (roomData[room].messages.length > 0) {
            socket.emit('load history', roomData[room].messages);
        }
        if (roomData[room].currentVideo) {
            socket.emit('sync video', roomData[room].currentVideo);
        }
    });

    // 1. Synchronized Chat Messages
    socket.on('chat message', (data) => {
        if (roomData[data.room]) {
            roomData[data.room].messages.push(data);
            // Keep history manageable (last 50 messages)
            if (roomData[data.room].messages.length > 50) {
                roomData[data.room].messages.shift();
            }
        }
        // Broadcast to everyone in the room (including sender for sync sound)
        io.to(data.room).emit('chat message', data);
    });

    // 2. YouTube Video Sync (Setting the video)
    socket.on('play video', (data) => {
        if (roomData[data.room]) {
            roomData[data.room].currentVideo = data.videoId;
        }
        io.to(data.room).emit('sync video', data.videoId);
    });

    // 3. YouTube Action Sync (Play/Pause/Seek)
    socket.on('yt_control', (data) => {
        // Broadcast 'play' or 'pause' to everyone in the room
        io.to(data.room).emit('yt_action', data);
    });

    // 4. Distance Ping Logic
    socket.on('send location', (data) => {
        // Send the sender's coordinates to the other person in the room
        socket.to(data.room).emit('receive location', data);
    });

    // 5. Typing Indicator
    socket.on('typing', (data) => {
        socket.to(data.room).emit('user typing', data);
    });

    // 6. The Buzz
    socket.on('send buzz', (room) => {
        io.to(room).emit('get buzzed');
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

// Use the port provided by Render or default to 10000
const PORT = process.env.PORT || 10000;
http.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});
