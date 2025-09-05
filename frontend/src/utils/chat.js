const normId = (u) => (u ? u._id || u.id || null : null);

export const getConversationId = (user, users) => {
  if (!users || users.length < 1 || !user) return null;
  const me = normId(user);
  if (users.length === 1) {
    const other = normId(users[0]);
    return other && other !== me ? other : null;
  }
  const a = normId(users[0]);
  const b = normId(users[1]);
  if (!a && !b) return null;
  return a === me ? b : a;
};

export const getConversationName = (user, users) => {
  if (!users || !user) return "Unknown";
  const me = normId(user);
  const other = users.find((u) => normId(u) && normId(u) !== me);
  return other ? (other.name || "Unknown") : "Unknown";
};

export const getConversationPicture = (user, users) => {
  if (!users || !user) return "";
  const me = normId(user);
  const other = users.find((u) => normId(u) && normId(u) !== me);
  return other ? other.picture || "" : "";
};

export const checkOnlineStatus = (onlineUsers, user, users) => {
  if (!onlineUsers || !user || !users) return false;
  const convoId = getConversationId(user, users);
  if (!convoId) return false;
  const check = onlineUsers.find((u) => u.userId === convoId);
  return !!check;
};
