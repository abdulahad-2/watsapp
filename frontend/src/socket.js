import { io } from "socket.io-client";

// Use Vite env variable or fallback
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL;

const socket = io(SOCKET_URL);

// Optional: log connection
socket.on("connect", () => {
  console.log("Connected to socket server:", socket.id);
});

// Listen for online users
socket.on("get-online-users", (users) => {
  console.log("Online users:", users);
});

// Listen for incoming messages
socket.on("receive message", (message) => {
  console.log("New message received:", message);
});

// Listen for calls
socket.on("call user", (data) => {
  console.log("Incoming call:", data);
});

// Export the socket
export default socket;
