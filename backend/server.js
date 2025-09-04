// backend/server.js
import express from "express";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import authMiddleware from "./src/middlewares/authMiddleware.js";
import socketServer from "./src/SocketServer.js";

dotenv.config();

const app = express();
app.use(express.json());

// HTTP server
const server = http.createServer(app);

// ✅ Allowed origins (match with app.js)
const allowedOrigins = [
  process.env.CLIENT_ENDPOINT || "http://localhost:3000",
  "https://chatapp-9owodedez-abdulahad-2s-projects.vercel.app",
  "https://chatapp-git-main-abdulahad-2s-projects.vercel.app",
  "https://chatapp-rho-six.vercel.app",
  "https://watsapp-mu.vercel.app",
];

// Socket.IO server
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// ✅ Socket authentication middleware
io.use(async (socket, next) => {
  try {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.split(" ")[1];

    if (!token) return next(new Error("Unauthorized"));

    // verify token with Supabase
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data?.user) return next(new Error("Unauthorized"));

    socket.user = data.user; // attach user object
    next();
  } catch (err) {
    next(new Error("Unauthorized"));
  }
});

io.on("connection", (socket) => {
  console.log("✅ Socket connected:", socket.id);

  // Attach all socket events
  socketServer(socket, io);
});

// Example protected route
app.get("/api/protected", authMiddleware, (req, res) => {
  res.json({ message: "You are authenticated!", user: req.user });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
