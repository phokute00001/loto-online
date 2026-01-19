const socket = io();

const nameInput = document.getElementById("name");
const roomInput = document.getElementById("room");
const coinInput = document.getElementById("coin");
const ticketSelect = document.getElementById("tickets");

const btnCreate = document.getElementById("btnCreate");
const btnJoin = document.getElementById("btnJoin");

// ====== TẠO PHÒNG – CÁI ======
btnCreate.onclick = () => {
  const name = nameInput.value.trim();
  const roomId = roomInput.value.trim();

  if (!name || !roomId) {
    alert("Vui lòng nhập tên và mã phòng");
    return;
  }

  socket.emit("create-room", {
    roomId,
    name
  });

  socket.on("room-created", () => {
    localStorage.setItem("name", name);
    localStorage.setItem("room", roomId);
    localStorage.setItem("role", "host");
    window.location.href = "room.html";
  });
};

// ====== VÀO PHÒNG – NGƯỜI CHƠI ======
btnJoin.onclick = () => {
  const name = nameInput.value.trim();
  const roomId = roomInput.value.trim();
  const coin = Number(coinInput.value);
  const tickets = Number(ticketSelect.value);

  if (!name || !roomId) {
    alert("Vui lòng nhập tên và mã phòng");
    return;
  }

  if (coin < tickets * 5) {
    alert("Không đủ coin để mua vé");
    return;
  }

  localStorage.setItem("name", name);
  localStorage.setItem("room", roomId);
  localStorage.setItem("coin", coin);
  localStorage.setItem("tickets", tickets);
  localStorage.setItem("role", "player");

  socket.emit("join-room", {
    roomId,
    name,
    tickets
  });

  socket.on("your-tickets", () => {
    window.location.href = "room.html";
  });
};
