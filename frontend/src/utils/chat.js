export const getConversationId = (user, users) => {
  if (!users || users.length < 2 || !user) return null;
  return users[0]._id === user._id ? users[1]._id : users[0]._id;
};
export const getConversationName = (user, users) => {
  if (!users || !user) return "Unknown";
  if (users.length < 2) {
    // Handle conversations with only 1 user (broken data)
    const otherUser = users.find(u => u._id !== user._id);
    return otherUser ? otherUser.name : "Unknown";
  }
  return users[0]._id === user._id ? users[1].name : users[0].name;
};
export const getConversationPicture = (user, users) => {
  if (!users || users.length < 2 || !user) return "";
  return users[0]._id === user._id ? users[1].picture : users[0].picture;
};

export const checkOnlineStatus = (onlineUsers, user, users) => {
  if (!onlineUsers || !user || !users) return false;
  let convoId = getConversationId(user, users);
  if (!convoId) return false;
  let check = onlineUsers.find((u) => u.userId === convoId);
  return check ? true : false;
};
