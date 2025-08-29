// backend/server.js
import express from "express";
import http from "http";
import { Server } from "socket.io";
import authMiddleware from "./src/middleware/authMiddleware.js";
import socketServer from "./src/backend/socketServer.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

// HTTP server
const server = http.createServer(app);

// Socket.IO server
const io = new Server(server, {
  cors: {
    origin: "*", // frontend Vite app ka origin, ya "*"
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  // Attach all socket events
  socketServer(socket, io);

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Example protected route
app.get("/api/protected", authMiddleware, (req, res) => {
  res.json({ message: "You are authenticated!", user: req.user });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
