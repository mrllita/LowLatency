const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

io.on("connection", (socket) => {
  socket.on("join_room", (roomId) => {
    socket.join(roomId);
  });

  // Broadcast player state changes to everyone else in the room
  socket.on("sync_action", ({ roomId, action, currentTime }) => {
    socket.to(roomId).emit("receive_action", { action, currentTime });
  });

  // Periodic heartbeat from the host to correct drift
  socket.on("heartbeat", ({ roomId, currentTime, isPlaying }) => {
    socket.to(roomId).emit("receive_heartbeat", { currentTime, isPlaying });
  });
});

server.listen(3001, () => {
  console.log("Sync server running on port 3001");
});
