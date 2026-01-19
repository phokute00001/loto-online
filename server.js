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

  socket.on("create-room", ({ roomId, name }) => {
    if (rooms[roomId]) return;

    rooms[roomId] = {
      hostId: socket.id,
      hostName: name,
      called: [],
      players: {}
    };

    socket.join(roomId);
    socket.emit("room-created", { roomId });
  });

  socket.on("join-room", ({ roomId, name }) => {
    const room = rooms[roomId];
    if (!room) return;

    const ticket = generateTicket();
    room.players[socket.id] = { name, ticket };
    socket.join(roomId);

    socket.emit("joined-room", {
      ticket,
      host: room.hostName,
      history: room.called
    });
  });

  socket.on("call-number", roomId => {
    const room = rooms[roomId];
    if (!room) return;

    // 🔒 KHÓA TUYỆT ĐỐI
    if (socket.id !== room.hostId) return;

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

  socket.on("claim-win", ({ roomId, type, name }) => {
    io.to(roomId).emit("winner", { type, name });
  });

  socket.on("disconnect", () => {
    for (const roomId in rooms) {
      const room = rooms[roomId];
      if (room.hostId === socket.id) {
        io.to(roomId).emit("room-closed");
        delete rooms[roomId];
      } else {
        delete room.players[socket.id];
      }
    }
  });

});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log("🚀 Lô Tô Online chạy tại port", PORT);
});
