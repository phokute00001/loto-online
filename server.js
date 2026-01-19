const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

const rooms = {};

// tạo vé 25 số
function generateTicket() {
  const nums = [];
  while (nums.length < 25) {
    const n = Math.floor(Math.random() * 90) + 1;
    if (!nums.includes(n)) nums.push(n);
  }
  return nums;
}

io.on("connection", socket => {

  // TẠO PHÒNG → NGƯỜI TẠO = HOST
  socket.on("create-room", ({ roomId, name }) => {
    if (rooms[roomId]) return;

    rooms[roomId] = {
      hostId: socket.id,
      called: [],
      players: {}
    };

    const ticket = generateTicket();

    rooms[roomId].players[socket.id] = {
      name,
      role: "host",
      ticket
    };

    socket.join(roomId);

    socket.emit("room-joined", {
      roomId,
      role: "host",
      ticket
    });

    io.to(roomId).emit("players", rooms[roomId].players);
  });

  // VÀO PHÒNG → PLAYER
  socket.on("join-room", ({ roomId, name }) => {
    const room = rooms[roomId];
    if (!room) return;

    const ticket = generateTicket();

    room.players[socket.id] = {
      name,
      role: "player",
      ticket
    };

    socket.join(roomId);

    socket.emit("room-joined", {
      roomId,
      role: "player",
      ticket
    });

    io.to(roomId).emit("players", room.players);
  });

  // HOST GỌI SỐ
  socket.on("call-number", roomId => {
    const room = rooms[roomId];
    if (!room) return;

    // CHỈ HOST MỚI ĐƯỢC GỌI
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

  // BÁO THẮNG
  socket.on("claim-win", roomId => {
    const room = rooms[roomId];
    if (!room) return;

    const player = room.players[socket.id];
    if (!player) return;

    io.to(roomId).emit("winner", player.name);
  });

  // NGƯỜI THOÁT PHÒNG
  socket.on("disconnect", () => {
    for (const roomId in rooms) {
      const room = rooms[roomId];

      if (room.players[socket.id]) {
        const wasHost = room.hostId === socket.id;
        delete room.players[socket.id];

        // nếu HOST thoát → nhường ghế
        if (wasHost) {
          const nextHostId = Object.keys(room.players)[0];
          if (nextHostId) {
            room.hostId = nextHostId;
            room.players[nextHostId].role = "host";
          } else {
            delete rooms[roomId];
            return;
          }
        }

        io.to(roomId).emit("players", room.players);
      }
    }
  });

});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log("🚀 Public Lô Tô chạy tại port", PORT);
});
