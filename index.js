const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, { cors: { origin: "*" } });

app.use(express.static(__dirname));
let roomData = {};

io.on('connection', (socket) => {
    let userRoom = "";
    let userLabel = "";

    socket.on('join room', (data) => {
        const { room, user } = data;
        userRoom = room; userLabel = user;
        socket.join(room);
        
        if (!roomData[room]) {
            roomData[room] = { messages: [], users: {'J':'offline','I':'offline'} };
        }
        
        roomData[room].users[user] = "online";
        io.to(room).emit('status_update', roomData[room].users);
        
        // Send history to the user joining
        if (roomData[room].messages.length > 0) {
            socket.emit('load history', roomData[room].messages);
        }
    });

    socket.on('chat message', (data) => {
        if (roomData[data.room]) {
            roomData[data.room].messages.push(data);
            if (roomData[data.room].messages.length > 200) roomData[data.room].messages.shift();
        }
        io.to(data.room).emit('chat message', data);
    });

    socket.on('disconnect', () => {
        if (userRoom && roomData[userRoom]) {
            roomData[userRoom].users[userLabel] = "offline";
            io.to(userRoom).emit('status_update', roomData[userRoom].users);
        }
    });

    socket.on('typing', (data) => socket.to(data.room).emit('typing', data));
    socket.on('sync video', (data) => io.to(data.room).emit('sync video', data));
    socket.on('heart_burst', (room) => io.to(room).emit('heart_burst'));
});

const PORT = process.env.PORT || 10000;
http.listen(PORT, '0.0.0.0', () => console.log('Hub Server Active'));
