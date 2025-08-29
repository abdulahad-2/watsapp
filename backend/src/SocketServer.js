let onlineUsers = []; // in-memory store for connected users

export default function (socket, io) {
  // ✅ user joins app (login ke baad frontend se emit hoga)
  socket.on("join", (userId) => {
    if (!userId) return;

    socket.join(userId); // user ke liye ek private room
    // agar user already online list me nahi hai to push karo
    if (!onlineUsers.some((u) => u.userId === userId)) {
      onlineUsers.push({ userId, socketId: socket.id });
    }

    // send updated online users list
    io.emit("get-online-users", onlineUsers);

    // send socket id back to frontend
    socket.emit("setup socket", socket.id);
  });

  // ✅ socket disconnect
  socket.on("disconnect", () => {
    onlineUsers = onlineUsers.filter((user) => user.socketId !== socket.id);
    io.emit("get-online-users", onlineUsers);
  });

  // ✅ join conversation room
  socket.on("join conversation", (conversationId) => {
    if (conversationId) socket.join(conversationId);
  });

  // ✅ send and receive message
  socket.on("send message", (message) => {
    if (!message || !message.conversation || !Array.isArray(message.conversation.users)) return;

    const { conversation, sender } = message;
    if (!sender || !sender._id) return;

    conversation.users.forEach((user) => {
      if (!user || !user._id) return;
      if (user._id === sender._id) return; // don't send to self

      socket.in(user._id).emit("receive message", message);
    });
  });

  // ✅ typing indicators
  socket.on("typing", (conversationId) => {
    if (conversationId) socket.in(conversationId).emit("typing", conversationId);
  });

  socket.on("stop typing", (conversationId) => {
    if (conversationId) socket.in(conversationId).emit("stop typing", conversationId);
  });

  // ✅ calling system
  // --- call user
  socket.on("call user", (data) => {
    let userId = data.userToCall;
    let userSocket = onlineUsers.find((user) => user.userId == userId);

    if (userSocket) {
      io.to(userSocket.socketId).emit("call user", {
        signal: data.signal,
        from: data.from,
        name: data.name,
        picture: data.picture,
      });
    }
  });

  // --- answer call
  socket.on("answer call", (data) => {
    if (data?.to) io.to(data.to).emit("call accepted", data.signal);
  });

  // --- end call
  socket.on("end call", (id) => {
    if (id) io.to(id).emit("end call");
  });

  // ✅ message deletion
  socket.on("message deleted", (data) => {
    const { messageId, conversationId } = data;
    if (messageId && conversationId) {
      socket.in(conversationId).emit("message deleted", { messageId, conversationId });
    }
  });
}
