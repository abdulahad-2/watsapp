let onlineUsers = {}; // { userId: [socketId1, socketId2...] }

export default function (socket, io) {
  // User joins app
  socket.on("join", (userId) => {
    if (!userId) return;

    socket.join(userId); // private room

    if (!onlineUsers[userId]) {
      onlineUsers[userId] = [];
    }
    if (!onlineUsers[userId].includes(socket.id)) {
      onlineUsers[userId].push(socket.id);
    }

    io.emit("user-online", { userId }); // send only user who came online
    socket.emit("setup socket", socket.id);
  });

  // Socket disconnect
  socket.on("disconnect", () => {
    for (let userId in onlineUsers) {
      onlineUsers[userId] = onlineUsers[userId].filter(
        (sid) => sid !== socket.id
      );
      if (onlineUsers[userId].length === 0) {
        delete onlineUsers[userId];
        io.emit("user-offline", { userId });
      }
    }
  });

  // Join conversation room
  socket.on("join conversation", (conversationId) => {
    if (conversationId) socket.join(conversationId);
  });

  // Send message
  socket.on("send message", (message) => {
    const { conversation, sender } = message || {};
    if (!conversation?.users || !sender?._id) return;

    conversation.users.forEach((user) => {
      const uid = user._id || user.id || user;
      if (!uid || uid === sender._id) return;
      socket.in(uid).emit("receive message", message);
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
    const sockets = onlineUsers[data.userToCall] || [];
    sockets.forEach((sid) => {
      io.to(sid).emit("call user", {
        signal: data.signal,
        from: data.from,
        name: data.name,
        picture: data.picture,
      });
    });
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
