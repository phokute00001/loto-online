const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

const rooms = {}; 
// rooms[roomId] = { players: [{id,name}], hostId }

io.on("connection", socket => {

  socket.on("create-room", ({ room, name }) => {
    if (rooms[room]) {
      socket.emit("error-msg", "❌ Phòng đã tồn tại");
      return;
    }

    rooms[room] = {
      hostId: socket.id,
      players: [{ id: socket.id, name }]
    };

    socket.join(room);
    io.to(room).emit("room-update", rooms[room]);
  });

  socket.on("join-room", ({ room, name }) => {
    if (!rooms[room]) {
      socket.emit("error-msg", "❌ Phòng không tồn tại");
      return;
    }

    rooms[room].players.push({ id: socket.id, name });
    socket.join(room);

    io.to(room).emit("room-update", rooms[room]);
  });

  socket.on("send-chat", ({ room, name, text }) => {
    io.to(room).emit("chat", `${name}: ${text}`);
  });

  socket.on("disconnect", () => {
    for (const room in rooms) {
      rooms[room].players = rooms[room].players.filter(p => p.id !== socket.id);
      if (rooms[room].players.length === 0) delete rooms[room];
      else io.to(room).emit("room-update", rooms[room]);
    }
  });
});

server.listen(process.env.PORT || 3000);
