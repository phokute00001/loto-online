const socket = io();
const params = new URLSearchParams(window.location.search);

const roomId = params.get("room");
const name = params.get("name");

const messages = document.getElementById("messages");

function addMsg(user, text) {
  const div = document.createElement("div");
  div.innerHTML = `<b>${user}:</b> ${text}`;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

document.getElementById("sendBtn").onclick = () => {
  const input = document.getElementById("chatInput");
  if (!input.value) return;

  socket.emit("chat", {
    roomId,
    name,
    message: input.value
  });

  input.value = "";
};

document.getElementById("doiBtn").onclick = () => {
  socket.emit("doi", roomId);
};

socket.on("chat-message", data => {
  addMsg(data.user, data.text);
});

socket.on("error-msg", msg => {
  alert(msg);
});
