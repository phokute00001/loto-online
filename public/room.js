const socket = io();

const role = localStorage.getItem("role");
const roomId = localStorage.getItem("room");

const callBtn = document.getElementById("callBtn");
const calledBox = document.getElementById("calledNumbers");
const ticketsBox = document.getElementById("tickets");

if (role !== "host") {
  callBtn.style.display = "none";
}

// ====== KÊU SỐ ======
callBtn.onclick = () => {
  socket.emit("call-number", roomId);
};

// ====== NHẬN SỐ KÊU ======
socket.on("number-called", data => {
  const span = document.createElement("span");
  span.textContent = data.number;
  calledBox.appendChild(span);

  document.querySelectorAll(".cell").forEach(c => {
    if (Number(c.dataset.num) === data.number) {
      c.classList.add("hit");
    }
  });
});

// ====== NHẬN VÉ ======
socket.on("ticket", tickets => {
  tickets.forEach((nums, index) => {
    const div = document.createElement("div");
    div.innerHTML = `<b>Vé ${index + 1}</b>`;
    div.className = "ticket";

    nums.forEach(n => {
      const c = document.createElement("div");
      c.className = "cell";
      c.dataset.num = n;
      c.textContent = n;
      div.appendChild(c);
    });

    ticketsBox.appendChild(div);
  });
});

// ====== KINH ======
document.getElementById("claimLine").onclick = () => {
  socket.emit("claim-win", { roomId, type: "line" });
};

document.getElementById("claimFull").onclick = () => {
  socket.emit("claim-win", { roomId, type: "full" });
};

socket.on("winner", name => {
  alert("🎉 Người thắng: " + name);
});
