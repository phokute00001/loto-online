const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

const rooms = {};
/*
rooms[room] = {
  hostId,
  inGame: false,
  called: [],
  players: [{id,name}]
}
*/

function randomNumber(called) {
  let n;
  do {
    n = Math.floor(Math.random() * 90) + 1;
  } while (called.includes(n));
  return n;
}

io.on("connection", socket => {

  socket.on("create-room", ({ room, name }) => {
    if (rooms[room]) {
      socket.emit("error-msg", "❌ Phòng đã tồn tại");
      return;
    }

    rooms[room] = {
      hostId: socket.id,
      inGame: false,
      called: [],
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

  socket.on("start-game", room => {
    const r = rooms[room];
    if (!r || socket.id !== r.hostId) return;

    r.inGame = true;
    r.called = [];
    io.to(room).emit("game-started");
  });

  socket.on("call-number", room => {
    const r = rooms[room];
    if (!r || socket.id !== r.hostId || !r.inGame) return;

    const num = randomNumber(r.called);
    r.called.push(num);

    io.to(room).emit("number-called", num);
  });

  socket.on("send-chat", ({ room, name, text }) => {
    io.to(room).emit("chat", `${name}: ${text}`);
  });

  socket.on("disconnect", () => {
    for (const room in rooms) {
      const r = rooms[room];
      r.players = r.players.filter(p => p.id !== socket.id);

      if (r.players.length === 0) delete rooms[room];
      else {
        if (r.hostId === socket.id) {
          r.hostId = r.players[0].id; // chuyển cái
        }
        io.to(room).emit("room-update", r);
      }
    }
  });
});

server.listen(process.env.PORT || 3000);