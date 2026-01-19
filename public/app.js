const socket = io();
const roomId = new URLSearchParams(location.search).get("room");

const pot = document.getElementById("pot");
const historyBox = document.getElementById("history");

document.getElementById("callBtn").onclick = () =>
  socket.emit("call-number", roomId);

document.getElementById("newRound").onclick = () =>
  socket.emit("new-round", roomId);

document.getElementById("requestHost").onclick = () =>
  socket.emit("request-host", roomId);

socket.on("room-update", room => {
  pot.innerText = room.pot;

  historyBox.innerHTML = "";
  room.history.forEach(h => {
    const li = document.createElement("li");
    li.innerText =
      `${h.time} – KINH: ${h.winners.join(", ")} – ăn ${h.reward} coin`;
    historyBox.appendChild(li);
  });
});

socket.on("host-request", data => {
  if (confirm(`${data.from} xin làm Cái. Đồng ý?`)) {
    socket.emit("host-decision", { roomId, accept: true });
  } else {
    socket.emit("host-decision", { roomId, accept: false });
  }
});

socket.on("game-over", () => {
  alert("🎉 ĐÃ KINH – XEM LỊCH SỬ VÁN");
});
