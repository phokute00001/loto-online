const socket = io();
let roomId = "";

function create() {
  roomId = document.getElementById("room").value;
  socket.emit("create-room", roomId);
}

function join() {
  roomId = document.getElementById("room").value;
  socket.emit("join-room", roomId,
    document.getElementById("name").value
  );
}

function call() {
  socket.emit("call-number", roomId);
}

function win() {
  socket.emit("claim-win", roomId);
}

socket.on("ticket", nums => {
  const t = document.getElementById("ticket");
  nums.forEach(n => {
    const d = document.createElement("div");
    d.className = "cell";
    d.innerText = n;
    t.appendChild(d);
  });
});

socket.on("number-called", data => {
  document.getElementById("number") &&
    (document.getElementById("number").innerText = data.number);

  document.getElementById("history").innerText =
    data.history.join(", ");
});

socket.on("winner", name => {
  alert("🏆 Người thắng: " + name);
});
