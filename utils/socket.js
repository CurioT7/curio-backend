const { Server } = require("socket.io");
const http = require("http");
require("dotenv").config();
const express = require("express");
const app = express();

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.VITE_SERVER_HOST || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

const getRecieverSocket = (recieverId) => {
  return io.sockets.sockets.get(recieverId);
};

const userSocketMap = new Map();

io.on("connection", (socket) => {
  console.log("a user connected", socket.id);
  const userId = socket.handshake.query.userId;
  if (userId) {
    userSocketMap.set(userId, socket.id);
  }

  io.emit("user-connected", Object.keys(userSocketMap));
  socket.on("disconnect", () => {
    console.log("user disconnected", socket.id);
    userSocketMap.delete(userId);
    io.emit("user-disconnected", userId);
  });
});

module.exports = { io, getRecieverSocket, server, app };
