const socket = io();

const nameInput = document.getElementById("name");
const roomInput = document.getElementById("room");
const btnCreate = document.getElementById("create");
const btnJoin = document.getElementById("join");

btnCreate.onclick = () => {
  const name = nameInput.value.trim();
  const roomId = roomInput.value.trim();
  if (!name || !roomId) return alert("Nhập đủ tên và phòng");
  socket.emit("create-room", { roomId, name });
};

btnJoin.onclick = () => {
  const name = nameInput.value.trim();
  const roomId = roomInput.value.trim();
  if (!name || !roomId) return alert("Nhập đủ tên và phòng");
  socket.emit("join-room", { roomId, name });
};

socket.on("room-created", ({ roomId }) => {
  document.body.innerHTML = `
    <h2>🎙 HOST</h2>
    <p>Phòng: ${roomId}</p>
    <button id="call">Gọi số</button>
    <div id="history"></div>
  `;

  document.getElementById("call").onclick = () => {
    socket.emit("call-number", roomId);
  };
});

socket.on("joined-room", ({ ticket, host }) => {
  document.body.innerHTML = `
    <h2>🎟 PLAYER</h2>
    <p>Host: ${host}</p>
    <p>Vé của bạn:</p>
    <pre>${ticket.join(", ")}</pre>
    <div id="history"></div>
  `;
});

socket.on("number-called", data => {
  const h = document.getElementById("history");
  if (h) {
    h.innerHTML = `
      <h3>🔊 Số: ${data.number}</h3>
      <p>Lịch sử: ${data.history.join(", ")}</p>
    `;
  }
});

socket.on("room-closed", () => {
  alert("Host đã thoát, phòng đóng");
  location.reload();
});
