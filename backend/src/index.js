import "dotenv/config";
import { Server } from "socket.io";
import app from "./app.js";
import logger from "./configs/logger.config.js";
import SocketServer from "./SocketServer.js";

// Env variables
const PORT = process.env.PORT || 5000;

// Start server
let server = app.listen(PORT, () => {
  logger.info(`🚀 Server is listening at ${PORT}`);
});

// Allowed Origins
const allowedOrigins = [
  process.env.CORS_ORIGIN || "http://localhost:3000",
  "https://chatapp-9owodedez-abdulahad-2s-projects.vercel.app",
  "https://chatapp-git-main-abdulahad-2s-projects.vercel.app",
  "https://chatapp-rho-six.vercel.app",
  "https://watsapp-mu.vercel.app",
];

// Socket.io setup with function-based CORS (array can fail sometimes)
const io = new Server(server, {
  pingTimeout: 120000, // 2 min timeout
  cors: {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) callback(null, true);
      else callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  },
});

// Socket connection
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

// Error handling
const unexpectedErrorHandler = (error) => {
  logger.error("💥 Unexpected Error:", error);
  exitHandler();
};

process.on("uncaughtException", unexpectedErrorHandler);
process.on("unhandledRejection", unexpectedErrorHandler);

// SIGTERM
process.on("SIGTERM", () => {
  logger.info("🛑 SIGTERM received. Closing server...");
  exitHandler();
});
