const socket = io();
const app = document.getElementById("app");

let myTicket=[], marked=Array(25).fill(false);
let roomId="", myName="";

const speak = text => {
  const u = new SpeechSynthesisUtterance(text);
  u.lang="vi-VN";
  speechSynthesis.speak(u);
};

document.getElementById("create").onclick=()=>{
  myName=name.value.trim();
  roomId=room.value.trim();
  if(!myName||!roomId) return alert("Nhập đủ");
  socket.emit("create-room",{roomId,name:myName});
};

document.getElementById("join").onclick=()=>{
  myName=name.value.trim();
  roomId=room.value.trim();
  if(!myName||!roomId) return alert("Nhập đủ");
  socket.emit("join-room",{roomId,name:myName});
};

socket.on("room-created",({roomId})=>{
  app.innerHTML=`
    <h3>🎙 HOST</h3>
    <p>Phòng: ${roomId}</p>
    <button id="call">📢 KÊU SỐ</button>
    <div class="history" id="history"></div>
  `;
  call.onclick=()=>socket.emit("call-number",roomId);
});

socket.on("joined-room",({ticket,host,history})=>{
  myTicket=ticket;
  app.innerHTML=`
    <h3>🎟 PLAYER</h3>
    <p>Host: ${host}</p>
    <div class="grid" id="grid"></div>
    <button id="claim">🏆 Báo Thắng</button>
    <div class="history" id="history">${history.join(", ")}</div>
  `;
  renderGrid();
  claim.onclick=checkWin;
});

function renderGrid(){
  const g=document.getElementById("grid");
  myTicket.forEach((n,i)=>{
    const d=document.createElement("div");
    d.className="cell";
    d.innerText=n;
    d.onclick=()=>{marked[i]=!marked[i];d.classList.toggle("marked");};
    g.appendChild(d);
  });
}

function checkWin(){
  const rows=[[0,1,2,3,4],[5,6,7,8,9],[10,11,12,13,14],[15,16,17,18,19],[20,21,22,23,24]];
  const rowWin=rows.some(r=>r.every(i=>marked[i]));
  const fullWin=marked.every(m=>m);
  if(rowWin) socket.emit("claim-win",{roomId,type:"HÀNG",name:myName});
  if(fullWin) socket.emit("claim-win",{roomId,type:"FULL",name:myName});
  if(!rowWin&&!fullWin) alert("Chưa thắng");
}

socket.on("number-called",d=>{
  speak(`Kêu số ${d.number}`);
  document.getElementById("history").innerHTML=d.history.join(", ");
});

socket.on("winner",({type,name})=>{
  alert(`🎉 ${name} thắng ${type}`);
});

socket.on("room-closed",()=>{
  alert("Host thoát – phòng đóng");
  location.reload();
});
