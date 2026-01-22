const express = require('express');
const app = express();
const http = require('http').createServer(app);
const https = require('https'); 
const io = require('socket.io')(http, { cors: { origin: "*" }, maxHttpBufferSize: 1e7 });

app.use(express.static(__dirname));
let roomData = {};

io.on('connection', (socket) => {
    let userRoom = "";
    let userLabel = "";

    socket.on('join room', (data) => {
        const { room, user } = data;
        userRoom = room; userLabel = user;
        socket.join(room);
        if (!roomData[room]) roomData[room] = { messages: [], users: {'J':'offline','I':'offline'}, theme: 'default' };
        roomData[room].users[user] = "online";
        io.to(room).emit('status_update', roomData[room].users);
        socket.emit('set_theme', roomData[room].theme);
        if (roomData[room].messages.length > 0) socket.emit('load history', roomData[room].messages);
    });

    socket.on('chat message', (data) => {
        if (roomData[data.room]) {
            roomData[data.room].messages.push(data);
            if (roomData[data.room].messages.length > 500) roomData[data.room].messages.shift();
        }
        io.to(data.room).emit('chat message', data);
    });

    socket.on('change_theme', (data) => {
        if (roomData[data.room]) {
            roomData[data.room].theme = data.theme;
            io.to(data.room).emit('set_theme', data.theme);
        }
    });

    socket.on('disconnect', () => {
        if (userRoom && roomData[userRoom]) {
            roomData[userRoom].users[userLabel] = "offline";
            io.to(userRoom).emit('status_update', roomData[userRoom].users);
        }
    });

    socket.on('typing', (data) => socket.to(data.room).emit('typing', data));
    socket.on('heart_burst', (room) => io.to(room).emit('heart_burst'));
    socket.on('sync video', (data) => io.to(data.room).emit('sync video', data));
    socket.on('send location', (data) => socket.to(data.room).emit('receive location', data));
    socket.on('send buzz', (room) => io.to(room).emit('get buzzed'));
});

const PORT = process.env.PORT || 10000;
http.listen(PORT, '0.0.0.0', () => { 
    setInterval(() => {
        const url = `https://your-app-name.onrender.com`; 
        https.get(url, (res) => {}).on('error', (e) => {});
    }, 840000);
});
