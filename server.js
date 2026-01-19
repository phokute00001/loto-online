const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

const rooms = {};

function checkNearWin(ticket, called) {
  // ticket: mảng 25 số
  // chia thành 5 hàng ngang
  for (let r = 0; r < 5; r++) {
    const row = ticket.slice(r * 5, r * 5 + 5);
    const hit = row.filter(n => called.includes(n));
    if (hit.length === 4) {
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
      called: [],
      players: {}
    };

    rooms[roomId].players[socket.id] = {
      name,
      tickets
    };

    socket.join(roomId);
  });

  socket.on("join-room", ({ roomId, name, tickets }) => {
    if (!rooms[roomId]) return;

    rooms[roomId].players[socket.id] = {
      name,
      tickets
    };

    socket.join(roomId);

    io.to(roomId).emit("chat-message", {
      user: "HỆ THỐNG",
      text: `${name} đã vào phòng`
    });
  });

  socket.on("call-number", roomId => {
    const room = rooms[roomId];
    if (!room || socket.id !== room.host) return;

    let n;
    do {
      n = Math.floor(Math.random() * 90) + 1;
    } while (room.called.includes(n));

    room.called.push(n);

    io.to(roomId).emit("number-called", n);
  });

  // ✋ ĐỢI (CÓ ĐIỀU KIỆN)
  socket.on("doi", roomId => {
    const room = rooms[roomId];
    if (!room) return;

    let text = "";

    if (socket.id === room.host) {
      text = "🎤 CÁI ĐỢI";
    } else {
      const player = room.players[socket.id];
      let allow = false;

      for (const ticket of player.tickets) {
        if (checkNearWin(ticket, room.called)) {
          allow = true;
          break;
        }
      }

      if (!allow) {
        socket.emit("error-msg", "❌ Chưa đủ điều kiện ĐỢI (cần 4/5 số 1 hàng)");
        return;
      }

      text = `🙋 ${player.name} ĐỢI`;
    }

    io.to(roomId).emit("chat-message", {
      user: "ĐỢI",
      text
    });
  });

  // 💬 CHAT
  socket.on("chat", ({ roomId, name, message }) => {
    io.to(roomId).emit("chat-message", {
      user: name,
      text: message
    });
  });

});

server.listen(process.env.PORT || 3000);
