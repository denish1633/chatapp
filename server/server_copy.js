const express = require('express')
const path = require('path'); // node js core moduele to do file control
const app = express();
const http = require('http');
const PORT = 3000;
const socketio = require('socket.io')
const server = http.createServer(app);
const io = socketio(server);
const formatMessage = require("./utils/message");
const botName = "ChatCord Bot";
const { userJoin, getCurrentUser, getRoomUsers, userLeave } = require("./utils/users");

// set static folder
app.use(express.static(path.join(__dirname, 'public')));

//Run when a client connects
io.on('connection', socket => {
    socket.on('joinRoom', ({ username, room }) => {
        const user = userJoin(socket.id, username, room);
        socket.join(user.room);
        socket.emit("message", formatMessage(botName, 'welcome to charcord'));
        socket.broadcast.to(user.room).emit('message', formatMessage(botName, `${user.username} has joined the chat`));
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        })
    })



    // get a chat message
    socket.on('chatMessage', (msg) => {
        const user = getCurrentUser(socket.id);
        io.to(user.room).emit("message", formatMessage(user.username, msg));
    })
    socket.on("disconnect", () => {
        const user = userLeave(socket.id);
        if (user) {
            io.to(user.room).emit('message', formatMessage(botName, `${user.username} has left the chat`));
            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUsers(user.room)
            })
        }

    })
})

server.listen(PORT, () => console.log(`Example app listening on PORT ${ PORT }!`));