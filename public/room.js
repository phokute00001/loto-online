const socket = io();

const params = new URLSearchParams(window.location.search);
const room = params.get("room");
const name = params.get("name");

document.getElementById("roomInfo").innerText = `Phòng: ${room}`;

socket.emit("join-room", { room, name });

const playersEl = document.getElementById("players");
const chatBox = document.getElementById("chatBox");
const input = document.getElementById("chatInput");

socket.on("room-update", data => {
  playersEl.innerHTML = "";
  data.players.forEach(p => {
    const li = document.createElement("li");
    li.textContent = p.name;
    playersEl.appendChild(li);
  });
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
