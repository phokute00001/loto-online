const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

const rooms = {};

function checkKinh(ticket, called) {
  for (let r = 0; r < 5; r++) {
    const row = ticket.slice(r * 5, r * 5 + 5);
    if (row.every(n => called.includes(n))) {
      return true;
    }
  }
  return false;
}

io.on("connection", socket => {

  socket.on("create-room", ({ roomId, name, tickets }) => {
    rooms[roomId] = {
      host: socket.id,
      hostName: name,
      status: "waiting",
      calledNumbers: [],
      pendingWinner: null,
      players: {}
    };

    rooms[roomId].players[socket.id] = {
      name,
      tickets,
      isSpectator: false
    };

    socket.join(roomId);
    io.to(roomId).emit("room-update", rooms[roomId]);
  });

  socket.on("join-room", ({ roomId, name }) => {
    const room = rooms[roomId];
    if (!room) return;

    room.players[socket.id] = {
      name,
      tickets: [],
      isSpectator: room.status !== "waiting"
    };

    socket.join(roomId);

    io.to(roomId).emit("chat-message", {
      user: "HỆ THỐNG",
      text: `${name} vào phòng (${room.status === "playing" ? "XEM" : "CHƠI"})`
    });

    io.to(roomId).emit("room-update", room);
  });

  // 🎤 CÁI KÊU SỐ
  socket.on("call-number", roomId => {
    const room = rooms[roomId];
    if (!room || socket.id !== room.host) return;
    if (room.status !== "playing") return;

    let n;
    do {
      n = Math.floor(Math.random() * 90) + 1;
    } while (room.calledNumbers.includes(n));

    room.calledNumbers.push(n);
    io.to(roomId).emit("number-called", n);

    // 🔍 KIỂM TRA TỰ ĐỘNG KINH
    for (const [sid, p] of Object.entries(room.players)) {
      if (p.isSpectator) continue;

      for (const ticket of p.tickets) {
        if (checkKinh(ticket, room.calledNumbers)) {
          room.status = "checking";
          room.pendingWinner = {
            socketId: sid,
            name: p.name,
            ticket
          };

          io.to(roomId).emit("chat-message", {
            user: "HỆ THỐNG",
            text: `🚨 ${p.name} báo KINH`
          });

          io.to(roomId).emit("need-check", room.pendingWinner);
          return;
        }
      }
    }
  });

  // 🔎 CÁI ĐỐI CHIẾU
  socket.on("confirm-kinh", roomId => {
    const room = rooms[roomId];
    if (!room || socket.id !== room.host) return;
    if (!room.pendingWinner) return;

    io.to(roomId).emit("chat-message", {
      user: "🎉 KẾT QUẢ",
      text: `${room.pendingWinner.name} KINH – ĂN NGUYÊN BÀN`
    });

    room.status = "waiting";
    room.calledNumbers = [];
    room.pendingWinner = null;

    io.to(roomId).emit("round-ended");
    io.to(roomId).emit("room-update", room);
  });

  // ▶ BẮT ĐẦU VÁN MỚI
  socket.on("start-round", roomId => {
    const room = rooms[roomId];
    if (!room || socket.id !== room.host) return;

    room.status = "playing";
    room.calledNumbers = [];
    room.pendingWinner = null;

    for (const p of Object.values(room.players)) {
      p.isSpectator = false;
    }

    io.to(roomId).emit("chat-message", {
      user: "HỆ THỐNG",
      text: "▶ BẮT ĐẦU VÁN MỚI"
    });

    io.to(roomId).emit("room-update", room);
  });

});
server.listen(process.env.PORT || 3000);
