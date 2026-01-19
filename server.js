const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

const TICKET_PRICE = 5;
const MAX_TICKETS = 2;

const rooms = {};

function genTicket() {
  const a=[];
  while(a.length<25){
    const n=Math.floor(Math.random()*90)+1;
    if(!a.includes(n)) a.push(n);
  }
  return a;
}

io.on("connection", socket => {

  socket.on("create-room", ({roomId,name,coin})=>{
    if(rooms[roomId]) return;

    rooms[roomId]={
      hostId:socket.id,
      round:1,
      called:[],
      history:[],
      players:{}
    };

    rooms[roomId].players[socket.id]={
      name, coin, tickets:[]
    };

    socket.join(roomId);
    socket.emit("room-created",{roomId});
  });

  socket.on("join-room", ({roomId,name,coin,ticketCount})=>{
    const room=rooms[roomId];
    if(!room) return;

    if(ticketCount<1||ticketCount>MAX_TICKETS) return;

    const cost=ticketCount*TICKET_PRICE;
    if(coin<cost) return;

    const tickets=[];
    for(let i=0;i<ticketCount;i++) tickets.push(genTicket());

    room.players[socket.id]={
      name,
      coin:coin-cost,
      tickets,
      marked: tickets.map(()=>Array(25).fill(false))
    };

    socket.join(roomId);

    socket.emit("joined-room",{
      tickets,
      coin:room.players[socket.id].coin,
      called:room.called
    });

    io.to(roomId).emit("players",room.players);
  });

  socket.on("call-number", roomId=>{
    const room=rooms[roomId];
    if(!room||socket.id!==room.hostId) return;

    let n;
    do{n=Math.floor(Math.random()*90)+1}
    while(room.called.includes(n));

    room.called.push(n);

    io.to(roomId).emit("number",{number:n,called:room.called});
  });

  socket.on("kinh", ({roomId})=>{
    const room=rooms[roomId];
    if(!room) return;

    const winners=[];
    let pot=0;

    Object.values(room.players).forEach(p=>{
      pot+=p.tickets.length*TICKET_PRICE;
    });

    winners.push(room.players[socket.id].name);

    winners.forEach(name=>{
      const p=Object.values(room.players).find(x=>x.name===name);
      if(p) p.coin+=pot/winners.length;
    });

    room.history.push({
      round:room.round,
      winners,
      pot,
      called:[...room.called]
    });

    room.round++;
    room.called=[];

    Object.values(room.players).forEach(p=>{
      p.tickets=p.tickets.map(()=>genTicket());
      p.marked=p.tickets.map(()=>Array(25).fill(false));
    });

    io.to(roomId).emit("new-round",{
      history:room.history,
      players:room.players
    });
  });

  socket.on("disconnect",()=>{
    for(const r in rooms){
      if(rooms[r].hostId===socket.id){
        io.to(r).emit("room-closed");
        delete rooms[r];
      }else{
        delete rooms[r].players[socket.id];
      }
    }
  });

});

server.listen(process.env.PORT||3000,()=>{
  console.log("🚀 Lô Tô KINH chạy");
});
