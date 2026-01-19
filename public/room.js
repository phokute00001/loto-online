const socket = io();
const params = new URLSearchParams(location.search);

const roomId = params.get("room");
const name = params.get("name");

const calledBox = document.getElementById("calledNumbers");
const messages = document.getElementById("messages");
const chatInput = document.getElementById("chatInput");

const hostControls = document.getElementById("hostControls");
const callBtn = document.getElementById("callBtn");
const confirmBtn = document.getElementById("confirmBtn");
const startBtn = document.getElementById("startBtn");

function addMessage(user, text) {
  const div = document.createElement("div");
  div.innerHTML = `<b>${user}:</b> ${text}`;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

// 📩 CHAT
document.getElementById("sendChat").onclick = () => {
  if (!chatInput.value.trim()) return;
  socket.emit("chat-message", {
    roomId,
    user: name,
    text: chatInput.value
  });
  chatInput.value = "";
};

// 🎤 CÁI KÊU SỐ
callBtn.onclick = () => {
  socket.emit("call-number", roomId);
};

// ✅ ĐỐI CHIẾU
confirmBtn.onclick = () => {
  socket.emit("confirm-kinh", roomId);
};

// ▶ VÁN MỚI
startBtn.onclick = () => {
  socket.emit("start-round", roomId);
};

// 📢 SỐ KÊU
socket.on("number-called", n => {
  const span = document.createElement("span");
  span.textContent = n;
  calledBox.appendChild(span);
});

// 💬 CHAT
socket.on("chat-message", data => {
  addMessage(data.user, data.text);
});

// ⚠️ BÁO KINH
socket.on("need-check", winner => {
  addMessage("⚠️ HỆ THỐNG", `${winner.name} báo KINH – chờ CÁI đối chiếu`);
});

// 🎉 KẾT QUẢ
socket.on("round-ended", () => {
  addMessage("🎉", "VÁN KẾT THÚC – CHỜ VÁN MỚI");
  calledBox.innerHTML = "";
});

// 🔄 CẬP NHẬT ROOM
socket.on("room-update", room => {
  if (room.host === socket.id) {
    hostControls.classList.remove("hidden");
  }
});
