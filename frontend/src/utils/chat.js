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

// Deterministic DM room id helpers (so both users share the same room id)
export const buildDirectConvoId = (userIdA, userIdB) => {
  if (!userIdA || !userIdB) return null;
  const a = String(userIdA);
  const b = String(userIdB);
  return a < b ? `dm_${a}_${b}` : `dm_${b}_${a}`;
};

export const parseDirectConvo = (convoId, myId) => {
  if (!convoId || typeof convoId !== "string") return null;
  if (!convoId.startsWith("dm_")) return null;
  const parts = convoId.slice(3).split("_");
  if (parts.length < 2) return null;
  const [id1, id2] = parts;
  const other = String(myId) === String(id1) ? id2 : id1;
  return { id1, id2, otherId: other };
};
