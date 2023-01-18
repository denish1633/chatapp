const io = require("socket.io")(8900, {
  cors: {
    origin: "http://localhost:3000",
  },
});
io.on("connection", (socket) => {
  var room;
  console.log("user connected");
  socket.on("joinRoom", ({ senderUser, recieverUser, roomId }) => {
    socket.join(roomId);
    room=roomId
  });
  socket.on("sendMessage", (data) => {
    data.roomId = room;
    if(io.sockets.adapter.rooms.get(room).size == 1)
    {
      socket.to(room).emit("getMessage", data);
      socket.broadcast.emit("notification", data);
    } 
    else if(io.sockets.adapter.rooms.get(room).size == 2)
    {
      socket.to(room).emit("getMessage", data);
    } 
  });
  socket.on("disconnect", () => {   
    socket.leave(room);
    console.log(`disconnected!`);
  });
});
