const socket = io();
const q = new URLSearchParams(location.search);
const room = q.get("room");
const name = q.get("name");

socket.emit("join-room", { room, name });

document.getElementById("sendBtn").onclick = send;
document.getElementById("chatInput").addEventListener("keydown", e=>{
  if(e.key==="Enter") send();
});

function send(){
  const v=document.getElementById("chatInput").value;
  if(!v) return;
  socket.emit("chat",{room,name,text:v});
  document.getElementById("chatInput").value="";
}

socket.on("ticket", t=>{
  const div=document.createElement("div");
  div.className="ticket";
  let html="<table>";
  for(let r=0;r<5;r++){
    html+="<tr>";
    for(let c=0;c<5;c++){
      html+=`<td>${t[r*5+c]}</td>`;
    }
    html+="</tr>";
  }
  html+="</table>";
  div.innerHTML=html;
  document.getElementById("tickets").appendChild(div);
});

socket.on("called", n=>{
  document.getElementById("called").innerHTML+=` ${n}`;
});

socket.on("chat", m=>{
  const d=document.createElement("div");
  d.textContent=m;
  document.getElementById("chatBox").appendChild(d);
});
