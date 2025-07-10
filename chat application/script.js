const socket = io();
const loginBtn = document.getElementById("loginBtn");
const exitBtn = document.getElementById("exitBtn");
const homePage = document.getElementById("homePage");
const chatRoom = document.getElementById("chatRoom");
const sendBtn = document.getElementById("sendBtn");
const msgInput = document.getElementById("msgInput");
const chatMessages = document.getElementById("chatMessages");
const userList = document.getElementById("userList");
const usernameInput = document.getElementById("username");



let username = "";

loginBtn.addEventListener("click", () => {
  username = usernameInput.value.trim();
  if (!username) {
    alert("Please enter your name");
    return;
  }

  chatRoom.classList.add("hidden");
 homePage.classList.remove("hidden");
 exitBtn.classList.add("hidden");

  socket.emit("join", username);
  homePage.classList.add("hidden");
  chatRoom.classList.remove("hidden");
  exitBtn.classList.remove("hidden");
  showPopup(`${username}, your login request has been accepted!`);
});

exitBtn.addEventListener("click", () => {
  socket.emit("leave", username);
  chatRoom.classList.add("hidden");
  homePage.classList.remove("hidden");
  exitBtn.classList.add("hidden");
  showPopup("You exited the chat room.");
});

sendBtn.addEventListener("click", () => {
  const msg = msgInput.value.trim();
  if (msg) {
    socket.emit("message", { username, msg });
    msgInput.value = "";
  }
});

socket.on("message", data => {
  chatMessages.innerHTML += `<div><strong>${data.username}:</strong> ${data.msg}</div>`;
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

socket.on("userlist", users => {
  userList.innerHTML = "";
  users.forEach(user => {
    userList.innerHTML += `<li>${user}</li>`;
  });
});

function showPopup(message) {
  const popup = document.createElement("div");
  popup.textContent = message;
  popup.style.position = "fixed";
  popup.style.bottom = "20px";
  popup.style.left = "50%";
  popup.style.transform = "translateX(-50%)";
  popup.style.background = "#fff";
  popup.style.color = "#000";
  popup.style.padding = "10px 20px";
  popup.style.borderRadius = "10px";
  popup.style.boxShadow = "0 2px 10px rgba(0,0,0,0.3)";
  document.body.appendChild(popup);
  setTimeout(() => popup.remove(), 3000);
}