const socket = io();

const params = new URLSearchParams(location.search);
const room = params.get("room");
const name = params.get("name");

const ticketsDiv = document.getElementById("tickets");
const calledDiv = document.getElementById("called");
const chatBox = document.getElementById("chatBox");
const input = document.getElementById("chatInput");
const hostControls = document.getElementById("hostControls");

socket.emit("join-room", { room, name });

socket.on("room-update", r => {
  if (socket.id === r.hostId) {
    hostControls.style.display = "block";
  }
});

document.getElementById("buyBtn").onclick = () => {
  socket.emit("buy-ticket", room);
};

socket.on("your-ticket", ticket => {
  const table = document.createElement("table");
  table.className = "ticket";

  for (let i = 0; i < 5; i++) {
    const tr = document.createElement("tr");
    for (let j = 0; j < 5; j++) {
      const td = document.createElement("td");
      td.textContent = ticket[i * 5 + j];
      tr.appendChild(td);
    }
    table.appendChild(tr);
  }
  ticketsDiv.appendChild(table);
});

document.getElementById("startBtn").onclick = () => {
  socket.emit("start-game", room);
  calledDiv.innerHTML = "";
};

document.getElementById("callBtn").onclick = () => {
  socket.emit("call-number", room);
};

socket.on("number-called", n => {
  calledDiv.innerHTML += n + " ";
});

document.getElementById("sendBtn").onclick = sendChat;
input.addEventListener("keydown", e => {
  if (e.key === "Enter") sendChat();
});

function sendChat() {
  if (!input.value.trim()) return;
  socket.emit("send-chat", { room, name, text: input.value });
  input.value = "";
}

socket.on("chat", msg => {
  const d = document.createElement("div");
  d.textContent = msg;
  chatBox.appendChild(d);
  chatBox.scrollTop = chatBox.scrollHeight;
});
