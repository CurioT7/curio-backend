const { Server } = require("socket.io");
const http = require("http");
require("dotenv").config();
const express = require("express");
const app = express();

const server = http.createServer(app);
const io = new Server(server, {
  cors: process.env.VITE_FRONTEND_HOST,
});

const getRecieverSocket = (username) => {
  return io.sockets.sockets.get(username);
};

const userSocketMap = new Map();

io.on("connection", (socket) => {
  //console.log("a user connected", socket.id);
  const username = socket.handshake.query.username;
  if (username) {
    userSocketMap.set(username, socket.id);
    console.log("userSocketMap", userSocketMap);
  }

  // Emit the updated list of connected users to all clients
  io.emit("user-connected", Array.from(userSocketMap.keys()));

  socket.on("disconnect", () => {
    console.log("user disconnected", socket.id);
    userSocketMap.delete(username);
    io.emit("user-disconnected", username);
  });
});

module.exports = { io, getRecieverSocket, server, app };
