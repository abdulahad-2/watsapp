import { Server } from "socket.io";
import app from "./app.js";
import logger from "./configs/logger.config.js";
import SocketServer from "./SocketServer.js";

//env variables
const PORT = process.env.PORT || 5000;

let server;

server = app.listen(PORT, () => {
  logger.info(`Server is listening at ${PORT}.`);
});

//socket io
const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: [
      process.env.CLIENT_ENDPOINT || "http://localhost:3000",
      "https://chatapp-9owodedez-abdulahad-2s-projects.vercel.app",
      "https://watsapp-mu.vercel.app"
    ],
    credentials: true,
  },
});
io.on("connection", (socket) => {
  logger.info("socket io connected successfully.");
  SocketServer(socket, io);
});

//handle server errors
const exitHandler = () => {
  if (server) {
    logger.info("Server closed.");
    process.exit(1);
  } else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error) => {
  logger.error(error);
  exitHandler();
};
process.on("uncaughtException", unexpectedErrorHandler);
process.on("unhandledRejection", unexpectedErrorHandler);

//SIGTERM
process.on("SIGTERM", () => {
  if (server) {
    logger.info("Server closed.");
    process.exit(1);
  }
});
