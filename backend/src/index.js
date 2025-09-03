import "dotenv/config";
import { Server } from "socket.io";
import app from "./app.js";
import logger from "./configs/logger.config.js";
import SocketServer from "./SocketServer.js";

// Env variables
const PORT = process.env.PORT || 5000;

let server = app.listen(PORT, () => {
  logger.info(`🚀 Server is listening at ${PORT}`);
});

// Allowed Origins for Socket.io
const allowedOrigins = [
  process.env.CLIENT_ENDPOINT || "http://localhost:3000",
  "https://chatapp-9owodedez-abdulahad-2s-projects.vercel.app",
  "https://chatapp-git-main-abdulahad-2s-projects.vercel.app",
  "https://chatapp-rho-six.vercel.app",
  "https://watsapp-mu.vercel.app",
];

// Socket.io setup
const io = new Server(server, {
  pingTimeout: 120000, // 2 min timeout for slow internet
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  logger.info("⚡ Socket.io connected successfully.");
  SocketServer(socket, io);

  socket.on("disconnect", () => {
    logger.info("⚡ Socket.io client disconnected.");
  });
});

// Graceful shutdown
const exitHandler = () => {
  if (server) {
    io.close(() => logger.info("⚡ Socket.io closed."));
    server.close(() => {
      logger.info("🛑 HTTP server closed.");
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error) => {
  logger.error("💥 Unexpected Error:", error);
  exitHandler();
};

process.on("uncaughtException", unexpectedErrorHandler);
process.on("unhandledRejection", unexpectedErrorHandler);

// SIGTERM (Render, Vercel etc.)
process.on("SIGTERM", () => {
  logger.info("🛑 SIGTERM received. Closing server...");
  exitHandler();
});
