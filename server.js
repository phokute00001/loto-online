const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

const rooms = {};

function genTicket() {
  const nums = [];
  while (nums.length < 25) {
    const n = Math.floor(Math.random() * 90) + 1;
    if (!nums.includes(n)) nums.push(n);
  }
  return nums;
}

function checkTicket(ticket, called) {
  const rows = [
    ticket.slice(0,5),
    ticket.slice(5,10),
    ticket.slice(10,15),
    ticket.slice(15,20),
    ticket.slice(20,25),
  ];

  for (const row of rows) {
    const hit = row.filter(n => called.includes(n)).length;
    if (hit === 5) return "KINH";
    if (hit === 4) return "DOI";
  }
  return null;
}

io.on("connection", socket => {

  socket.on("create-room", ({ room, name }) => {
    if (rooms[room]) {
      socket.emit("error-msg", "Phòng đã tồn tại");
      return;
    }

    rooms[room] = {
      hostId: socket.id,
      inGame: false,
      called: [],
      players: {},
      usedTickets: []
    };

    rooms[room].players[socket.id] = {
      name,
      tickets: []
    };

    socket.join(room);
    io.to(room).emit("room-update", rooms[room]);
  });

  socket.on("join-room", ({ room, name }) => {
    if (!rooms[room]) return;

    rooms[room].players[socket.id] = {
      name,
      tickets: []
    };

    socket.join(room);
    io.to(room).emit("room-update", rooms[room]);
  });

  socket.on("buy-ticket", room => {
    const r = rooms[room];
    if (!r || r.inGame) return;

    const player = r.players[socket.id];
    if (player.tickets.length >= 2) return;

    let ticket;
    do {
      ticket = genTicket();
    } while (
      r.usedTickets.some(t => JSON.stringify(t) === JSON.stringify(ticket))
    );

    player.tickets.push(ticket);
    r.usedTickets.push(ticket);

    socket.emit("your-ticket", ticket);
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
    if (!r || socket.id !== r.hostId) return;

    let n;
    do {
      n = Math.floor(Math.random() * 90) + 1;
    } while (r.called.includes(n));

    r.called.push(n);
    io.to(room).emit("number-called", n);

    for (const pid in r.players) {
      const p = r.players[pid];
      p.tickets.forEach(ticket => {
        const res = checkTicket(ticket, r.called);
        if (res === "DOI") {
          io.to(room).emit("chat", `⏳ ${p.name} ĐỢI`);
        }
        if (res === "KINH") {
          io.to(room).emit("chat", `🎉 ${p.name} KINH`);
          r.inGame = false;
        }
      });
    }
  });

  socket.on("send-chat", ({ room, name, text }) => {
    io.to(room).emit("chat", `${name}: ${text}`);
  });

  socket.on("disconnect", () => {
    for (const room in rooms) {
      const r = rooms[room];
      delete r.players[socket.id];
      if (Object.keys(r.players).length === 0) delete rooms[room];
    }
  });
});

server.listen(process.env.PORT || 3000);
