const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const Database = require("better-sqlite3");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

/* ===== DB ===== */
const db = new Database("db.sqlite");
db.prepare(`
CREATE TABLE IF NOT EXISTS history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  room TEXT,
  winner TEXT,
  amount INTEGER,
  time TEXT
)`).run();

/* ===== GAME ===== */
const rooms = {};
const TICKET_PRICE = 5;

function genTicket() {
  const nums = [];
  while (nums.length < 25) {
    const n = Math.floor(Math.random() * 90) + 1;
    if (!nums.includes(n)) nums.push(n);
  }
  return nums;
}

function check(ticket, called) {
  for (let r = 0; r < 5; r++) {
    const row = ticket.slice(r * 5, r * 5 + 5);
    const hit = row.filter(n => called.includes(n)).length;
    if (hit === 4) return "DOI";
    if (hit === 5) return "KINH";
  }
  return null;
}

io.on("connection", socket => {

  socket.on("create-room", ({ room, name, coin }) => {
    if (rooms[room]) return socket.emit("err", "Phòng đã tồn tại");

    rooms[room] = {
      host: socket.id,
      called: [],
      players: {},
      inGame: false,
      pot: 0
    };

    rooms[room].players[socket.id] = {
      name,
      coin,
      tickets: []
    };

    socket.join(room);
    io.to(room).emit("room-info", rooms[room]);
  });

  socket.on("join-room", ({ room, name, coin }) => {
    const r = rooms[room];
    if (!r || Object.keys(r.players).length >= 16) return;

    r.players[socket.id] = { name, coin, tickets: [] };
    socket.join(room);
    io.to(room).emit("room-info", r);
  });

  socket.on("buy-ticket", room => {
    const r = rooms[room];
    if (!r || r.inGame) return;

    const p = r.players[socket.id];
    if (p.coin < TICKET_PRICE || p.tickets.length >= 2) return;

    const t = genTicket();
    p.tickets.push(t);
    p.coin -= TICKET_PRICE;
    r.pot += TICKET_PRICE;

    socket.emit("ticket", t);
    io.to(room).emit("room-info", r);
  });

  socket.on("start-game", room => {
    const r = rooms[room];
    if (socket.id !== r.host) return;

    if (r.players[r.host].tickets.length < 2)
      return socket.emit("err", "CÁI phải có 2 vé");

    r.called = [];
    r.inGame = true;
    io.to(room).emit("start");
  });

  socket.on("call", room => {
    const r = rooms[room];
    if (!r || socket.id !== r.host || !r.inGame) return;

    let n;
    do {
      n = Math.floor(Math.random() * 90) + 1;
    } while (r.called.includes(n));
    r.called.push(n);

    io.to(room).emit("called", n);

    for (const id in r.players) {
      const p = r.players[id];
      for (const t of p.tickets) {
        const res = check(t, r.called);
        if (res === "DOI") {
          io.to(room).emit("chat", `⏳ ${p.name} ĐỢI`);
        }
        if (res === "KINH") {
          p.coin += r.pot;
          db.prepare(`
            INSERT INTO history(room,winner,amount,time)
            VALUES(?,?,?,?)
          `).run(room, p.name, r.pot, new Date().toISOString());

          io.to(room).emit("chat", `🎉 ${p.name} KINH – ăn ${r.pot} coin`);
          r.pot = 0;
          r.inGame = false;
        }
      }
    }
  });

  socket.on("chat", ({ room, name, text }) => {
    io.to(room).emit("chat", `${name}: ${text}`);
  });

});

server.listen(process.env.PORT || 3000);
