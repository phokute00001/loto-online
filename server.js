const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

const rooms = {};

function generateTicket() {
  const nums = [];
  while (nums.length < 25) {
    const n = Math.floor(Math.random() * 90) + 1;
    if (!nums.includes(n)) nums.push(n);
  }
  return nums;
}

io.on("connection", socket => {

  socket.on("create-room", roomId => {
    rooms[roomId] = {
      called: [],
      players: {}
    };
    socket.join(roomId);
    socket.emit("room-created", roomId);
  });

  socket.on("join-room", (roomId, name) => {
    if (!rooms[roomId]) return;

    const ticket = generateTicket();
    rooms[roomId].players[socket.id] = {
      name,
      ticket
    };

    socket.join(roomId);
    socket.emit("ticket", ticket);
    io.to(roomId).emit("players", rooms[roomId].players);
  });

  socket.on("call-number", roomId => {
    const room = rooms[roomId];
    if (!room) return;

    let num;
    do {
      num = Math.floor(Math.random() * 90) + 1;
    } while (room.called.includes(num));

    room.called.push(num);
    io.to(roomId).emit("number-called", {
      number: num,
      history: room.called
    });
  });

  socket.on("claim-win", roomId => {
    io.to(roomId).emit("winner", rooms[roomId].players[socket.id].name);
  });
});

server.listen(3000, () => {
  console.log("🚀 Public Lô Tô chạy tại port 3000");
});
