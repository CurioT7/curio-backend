const { Server } = require("socket.io");
const http = require("http");
require("dotenv").config();
const express = require("express");
const app = express();
const Chat = require("../models/chatModel");

const server = http.createServer(app);
const io = new Server(server, {
  cors: process.env.VITE_FRONTEND_HOST,
});

let onlineUsers = [];

const getRecieverSocket = (username) => {
  const receiverSocketId = userSocketMap.get(username);
  if (receiverSocketId) {
    return io.sockets.sockets.get(receiverSocketId);
  } else {
    return null;
  }
};

const userSocketMap = new Map();

io.on("connection", (socket) => {
  // console.log("a user connected", socket.id);
  socket.on("addNewUser", (username) => {
    !userSocketMap.has(username) && userSocketMap.set(username, socket.id);
    console.log(userSocketMap);
    socket.emit("username-set", username);
  });
  console.log("online", userSocketMap);

  // Emit the updated list of connected users to all clients
  io.emit("getOnlineUsers", Array.from(userSocketMap.keys()));

  socket.on("newMessage", (message, participants) => {
    if (!participants) return;
    //get recipients username
    console.log("new message", message);
    for (const participant of participants) {
      if (userSocketMap.has(participant)) {
        io.to(userSocketMap.get(participant)).emit(
          "getMessage",
          message,
          participant
        );
        console.log(`Receiver ${participant} online`);
      } else {
        console.log(`Receiver ${participant} not online`);
      }
    }
    // }
  });

  socket.on("disconnect", () => {
    console.log("user disconnected", userSocketMap.get(socket.id));
    // userSocketMap.delete(username);
    if (userSocketMap.has(socket.id)) {
      userSocketMap.delete(socket.id);
    }
    io.emit("getOnlineUsers", Array.from(userSocketMap.keys()));
  });
});

module.exports = { io, getRecieverSocket, server, app };
