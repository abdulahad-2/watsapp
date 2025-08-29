// backend/src/socketServer.js
let onlineUsers = []; // in-memory store

export default function (socket, io) {
  // User joins app
  socket.on("join", (userId) => {
    if (!userId) return;

    socket.join(userId); // private room for user
    if (!onlineUsers.some((u) => u.userId === userId)) {
      onlineUsers.push({ userId, socketId: socket.id });
    }

    io.emit("get-online-users", onlineUsers);
    socket.emit("setup socket", socket.id);
  });

  // Socket disconnect
  socket.on("disconnect", () => {
    onlineUsers = onlineUsers.filter((u) => u.socketId !== socket.id);
    io.emit("get-online-users", onlineUsers);
  });

  // Join conversation room
  socket.on("join conversation", (conversationId) => {
    if (conversationId) socket.join(conversationId);
  });

  // Send message
  socket.on("send message", (message) => {
    if (!message?.conversation?.users || !Array.isArray(message.conversation.users)) return;

    const { conversation, sender } = message;
    if (!sender?._id) return;

    conversation.users.forEach((user) => {
      if (!user?._id) return;
      if (user._id === sender._id) return; // skip self
      socket.in(user._id).emit("receive message", message);
    });
  });

  // Typing indicators
  socket.on("typing", (conversationId) => {
    if (conversationId) socket.in(conversationId).emit("typing", conversationId);
  });

  socket.on("stop typing", (conversationId) => {
    if (conversationId) socket.in(conversationId).emit("stop typing", conversationId);
  });

  // Calling
  socket.on("call user", (data) => {
    const userSocket = onlineUsers.find((u) => u.userId === data.userToCall);
    if (userSocket) {
      io.to(userSocket.socketId).emit("call user", {
        signal: data.signal,
        from: data.from,
        name: data.name,
        picture: data.picture,
      });
    }
  });

  socket.on("answer call", (data) => {
    if (data?.to) io.to(data.to).emit("call accepted", data.signal);
  });

  socket.on("end call", (id) => {
    if (id) io.to(id).emit("end call");
  });

  // Message deletion
  socket.on("message deleted", ({ messageId, conversationId }) => {
    if (messageId && conversationId) {
      socket.in(conversationId).emit("message deleted", { messageId, conversationId });
    }
  });
}
