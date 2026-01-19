const socket=io();
const app=document.getElementById("app");

create.onclick=()=>{
  socket.emit("create-room",{
    roomId:room.value,
    name:name.value,
    coin:+coin.value
  });
};

join.onclick=()=>{
  socket.emit("join-room",{
    roomId:room.value,
    name:name.value,
    coin:+coin.value,
    ticketCount:+tickets.value
  });
};

socket.on("joined-room",({tickets,coin,called})=>{
  app.innerHTML="<h3>VÉ CỦA BẠN</h3>";
  tickets.forEach((t,i)=>{
    app.innerHTML+=`<p>Vé ${i+1}: ${t.join(", ")}</p>`;
  });
  app.innerHTML+=`<p>Coin còn: ${coin}</p>`;
  app.innerHTML+=`<button onclick="socket.emit('kinh',{roomId:room.value})">🎉 KINH</button>`;
});

socket.on("number",d=>{
  console.log("Số kêu:",d.number);
});

socket.on("new-round",d=>{
  alert("🎉 KINH – sang ván mới");
  console.log("Lịch sử:",d.history);
});

socket.on("room-closed",()=>{
  alert("Phòng đóng");
  location.reload();
});
