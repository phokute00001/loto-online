const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

const rooms = {};

// ====== TẠO VÉ 5x5 ======
function generateTicket() {
  const nums = [];
  while (nums.length < 25) {
    const n = Math.floor(Math.random() * 90) + 1;
    if (!nums.includes(n)) nums.push(n);
  }
  return nums;
}

io.on("connection", socket => {

  // ====== CÁI TẠO PHÒNG ======
  socket.on("create-room", ({ roomId, name }) => {
    if (rooms[roomId]) return;

    rooms[roomId] = {
      hostId: socket.id,
      hostName: name,
      called: [],
      players: {}
    };

    socket.join(roomId);
    socket.emit("room-created", roomId);
  });

  // ====== NGƯỜI CHƠI VÀO PHÒNG ======
  socket.on("join-room", ({ roomId, name, tickets }) => {
    const room = rooms[roomId];
    if (!room) return;

    const myTickets = [];
    for (let i = 0; i < tickets; i++) {
      myTickets.push(generateTicket());
    }

    room.players[socket.id] = {
      name,
      tickets: myTickets
    };

    socket.join(roomId);
    socket.emit("your-tickets", myTickets);

    io.to(roomId).emit("players", {
      host: room.hostName,
      players: Object.values(room.players).map(p => p.name)
    });
  });

  // ====== CÁI KÊU SỐ ======
  socket.on("call-number", roomId => {
    const room = rooms[roomId];
    if (!room) return;
    if (socket.id !== room.hostId) return; // chỉ CÁI mới kêu

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

  // ====== BÁO KINH ======
  socket.on("claim-win", ({ roomId }) => {
  const room = rooms[roomId];
  if (!room) return;

  const player = room.players[socket.id];
  if (!player) return;

  io.to(roomId).emit("winner", player.name);

  // reset ván mới
  room.called = [];
  });

});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log("🚀 LÔ TÔ MIỀN NAM chạy port", PORT);
});
