const socket = io();

const params = new URLSearchParams(window.location.search);
const room = params.get("room");
const name = params.get("name");

const playersEl = document.getElementById("players");
const chatBox = document.getElementById("chatBox");
const input = document.getElementById("chatInput");
const calledEl = document.getElementById("called");
const hostControls = document.getElementById("hostControls");
const roleEl = document.getElementById("role");

document.getElementById("roomInfo").innerText = `Phòng: ${room}`;

socket.emit("join-room", { room, name });

socket.on("room-update", data => {
  playersEl.innerHTML = "";
  data.players.forEach(p => {
    const li = document.createElement("li");
    li.textContent = p.name;
    playersEl.appendChild(li);
  });

  if (socket.id === data.hostId) {
    roleEl.innerText = "🎤 Bạn là CÁI";
    hostControls.style.display = "block";
  } else {
    roleEl.innerText = "🎟 Người chơi";
    hostControls.style.display = "none";
  }
});

document.getElementById("startBtn").onclick = () => {
  socket.emit("start-game", room);
};

document.getElementById("callBtn").onclick = () => {
  socket.emit("call-number", room);
};

socket.on("game-started", () => {
  calledEl.innerHTML = "";
  alert("🎲 Ván mới bắt đầu!");
});

socket.on("number-called", num => {
  const span = document.createElement("span");
  span.textContent = num + " ";
  calledEl.appendChild(span);
});

document.getElementById("sendBtn").onclick = sendChat;
input.addEventListener("keydown", e => {
  if (e.key === "Enter") sendChat();
});

function sendChat() {
  const text = input.value.trim();
  if (!text) return;
  socket.emit("send-chat", { room, name, text });
  input.value = "";
}

socket.on("chat", msg => {
  const div = document.createElement("div");
  div.textContent = msg;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
});

socket.on("error-msg", msg => alert(msg));
