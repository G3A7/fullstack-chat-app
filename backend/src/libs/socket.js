import { Server } from "socket.io";
import express from "express";
import http from "http";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
  },
});

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

const userSocketMap = {}; // {userId:SocketId}

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);
  const userId = socket.handshake.query.userId; // Assuming userId is sent in the query params

  if (userId) {
    userSocketMap[userId] = socket.id; // Store the socket ID for the user
    console.log(`User ${userId} connected with socket ID: ${socket.id}`);
  }
  // Emit the list of online users to all clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap)); // Emit online users to all clients
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    delete userSocketMap[userId]; // Remove the user from the map
    io.emit("getOnlineUsers", Object.keys(userSocketMap)); // Emit updated online users
  });
});

export { io, server, app };
