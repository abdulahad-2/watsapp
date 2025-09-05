import express from "express";

const router = express.Router();

// Simple conversation routes that always return a usable conversation object
router.post("/", (req, res) => {
  const { receiver_id, isGroup, convo_id } = req.body || {};
  // Use an existing convo id if provided, else fall back to receiver id, else generate
  const id = convo_id || receiver_id || `mock_${Date.now()}`;
  const conversation = {
    _id: id,
    isGroup: !!isGroup,
    users: [],
    latestMessage: null,
  };
  return res.json(conversation);
});

router.get("/", (req, res) => {
  res.json([]);
});

router.post("/group", (req, res) => {
  const { name, users = [] } = req.body || {};
  const conversation = {
    _id: `group_${Date.now()}`,
    name: name || "New Group",
    isGroup: true,
    users,
    latestMessage: null,
  };
  return res.json(conversation);
});

export default router;
