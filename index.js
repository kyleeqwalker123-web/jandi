const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

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
        socket.emit('load history', roomData[room].messages);
    });

    socket.on('chat message', (data) => {
        if (roomData[data.room]) roomData[data.room].messages.push(data);
        io.to(data.room).emit('chat message', data);
    });

    socket.on('sync video', (data) => io.to(data.room).emit('sync video', data));
    socket.on('sync_trivia', (data) => io.to(data.room).emit('receive_trivia', data));
    socket.on('reveal_trivia', (room) => io.to(room).emit('reveal_trivia'));
    
    socket.on('disconnect', () => {
        if (userRoom && roomData[userRoom]) {
            roomData[userRoom].users[userLabel] = "offline";
            io.to(userRoom).emit('status_update', roomData[userRoom].users);
        }
    });
});

http.listen(process.env.PORT || 10000, '0.0.0.0');
