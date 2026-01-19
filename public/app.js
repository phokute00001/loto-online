const socket = io();

const nameInput = document.getElementById("name");
const roomInput = document.getElementById("room");
const coinInput = document.getElementById("coin");
const status = document.getElementById("status");

document.getElementById("createBtn").onclick = () => {
  const name = nameInput.value.trim();
  const room = roomInput.value.trim();
  const coin = coinInput.value;

  if (!name || !room) {
    status.textContent = "⚠️ Nhập đủ tên và mã phòng";
    return;
  }

  socket.emit("create-room", { room, name, coin });

  location.href = `/room.html?room=${room}&name=${name}`;
};

document.getElementById("joinBtn").onclick = () => {
  const name = nameInput.value.trim();
  const room = roomInput.value.trim();
  const coin = coinInput.value;

  if (!name || !room) {
    status.textContent = "⚠️ Nhập đủ tên và mã phòng";
    return;
  }

  socket.emit("join-room", { room, name, coin });

  location.href = `/room.html?room=${room}&name=${name}`;
};
