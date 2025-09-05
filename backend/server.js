// backend/server.js
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import app from "./src/app.js"; // Reuse the app that already has CORS and routes
import socketServer from "./src/SocketServer.js";

dotenv.config();

// HTTP server using the configured Express app
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

// Make io available to routes via req.app.get('io')
app.set("io", io);

// Socket authentication can be added later; for now allow connections

io.on("connection", (socket) => {
  console.log("✅ Socket connected:", socket.id);

  // Attach all socket events
  socketServer(socket, io);
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
