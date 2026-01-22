{\rtf1\ansi\ansicpg1252\cocoartf2867
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\pard\tx720\tx1440\tx2160\tx2880\tx3600\tx4320\tx5040\tx5760\tx6480\tx7200\tx7920\tx8640\pardirnatural\partightenfactor0

\f0\fs24 \cf0 const express = require('express');\
const app = express();\
const http = require('http').createServer(app);\
const io = require('socket.io')(http);\
\
app.get('/', (req, res) => \{\
  res.sendFile(__dirname + '/index.html');\
\});\
\
io.on('connection', (socket) => \{\
  socket.on('join room', (room) => socket.join(room));\
  socket.on('chat message', (data) => io.to(data.room).emit('chat message', data));\
  socket.on('react', (data) => io.to(data.room).emit('react', data));\
\});\
\
const PORT = process.env.PORT || 3000;\
http.listen(PORT, () => console.log('Server is running!'));\
\
}