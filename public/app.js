const socket = io();

const calledNumbers = [];
const tickets = {
  ticket1: [],
  ticket2: []
};

// Demo vé (bước sau sẽ lấy từ server)
function randomTicket() {
  const nums = [];
  while (nums.length < 25) {
    const n = Math.floor(Math.random() * 90) + 1;
    if (!nums.includes(n)) nums.push(n);
  }
  return nums;
}

function renderTicket(id, nums) {
  const el = document.getElementById(id);
  el.innerHTML = "";
  nums.forEach(n => {
    const cell = document.createElement("div");
    cell.className = "cell";
    cell.innerText = n;

    cell.onclick = () => {
      if (!calledNumbers.includes(n)) return;
      cell.classList.toggle("marked");
    };

    el.appendChild(cell);
  });
}

function renderCalled() {
  const box = document.getElementById("calledNumbers");
  box.innerHTML = "";
  calledNumbers.forEach(n => {
    const span = document.createElement("div");
    span.className = "called";
    span.innerText = n;
    box.appendChild(span);
  });
}

// Khởi tạo vé
tickets.ticket1 = randomTicket();
tickets.ticket2 = randomTicket();

renderTicket("ticket1", tickets.ticket1);
renderTicket("ticket2", tickets.ticket2);

// Demo kêu số (giả lập host)
setInterval(() => {
  if (calledNumbers.length >= 90) return;
  let n;
  do {
    n = Math.floor(Math.random() * 90) + 1;
  } while (calledNumbers.includes(n));

  calledNumbers.push(n);
  renderCalled();

  document.querySelectorAll(".cell").forEach(c => {
    if (parseInt(c.innerText) === n) {
      c.classList.add("called");
    }
  });
}, 3000);

// Nút KINH (bước sau mới xử lý)
document.getElementById("btnKinh").onclick = () => {
  alert("Đã hô KINH! (Bước sau server sẽ kiểm tra)");
};
