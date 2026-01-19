const socket = io();

function createRoom() {
  const name = document.getElementById("name").value.trim();
  const roomId = document.getElementById("room").value.trim();

  if (!name || !roomId) {
    alert("Nhập tên và mã phòng");
    return;
  }

  socket.emit("create-room", { roomId, name });
}

function joinRoom() {
  const name = document.getElementById("name").value.trim();
  const roomId = document.getElementById("room").value.trim();

  if (!name || !roomId) {
    alert("Nhập tên và mã phòng");
    return;
  }

  socket.emit("join-room", { roomId, name });
}

socket.on("room-joined", data => {
  document.getElementById("status").innerText =
    `Đã vào phòng ${data.roomId} (${data.role.toUpperCase()})`;
});

socket.on("players", players => {
  console.log("Danh sách người chơi:", players);
});
