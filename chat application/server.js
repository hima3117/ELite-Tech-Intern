// server.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

let users = [];

app.use(express.static(__dirname));

io.on("connection", (socket) => {
  socket.on("join", (username) => {
    socket.username = username;
    users.push(username);
    io.emit("userlist", users);
  });

  socket.on("message", (data) => {
    io.emit("message", data);
  });

  socket.on("leave", (username) => {
    users = users.filter(user => user !== username);
    io.emit("userlist", users);
  });

  socket.on("disconnect", () => {
    if (socket.username) {
      users = users.filter(user => user !== socket.username);
      io.emit("userlist", users);
    }
  });
});

server.listen(3000, () => {
  console.log("✅ Server running at http://localhost:3000");
});
