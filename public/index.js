function getData() {
  const name = document.getElementById("name").value.trim();
  const room = document.getElementById("room").value.trim();
  const coin = parseInt(document.getElementById("coin").value);
  const tickets = parseInt(document.getElementById("tickets").value);

  if (!name || !room || coin <= 0) {
    alert("Nhập đầy đủ thông tin");
    return null;
  }

  return { name, room, coin, tickets };
}

function createRoom() {
  const data = getData();
  if (!data) return;

  localStorage.setItem("loto", JSON.stringify({
    ...data,
    role: "host"
  }));

  window.location.href = "room.html";
}

function joinRoom() {
  const data = getData();
  if (!data) return;

  localStorage.setItem("loto", JSON.stringify({
    ...data,
    role: "player"
  }));

  window.location.href = "room.html";
}
