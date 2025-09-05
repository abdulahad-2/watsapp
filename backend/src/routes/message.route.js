import express from "express";

const router = express.Router();

// Simple message routes
router.post("/", (req, res) => {
  const { message, convo_id, files = [] } = req.body || {};
  if (!convo_id) {
    return res.status(400).json({ error: { status: 400, message: "convo_id required" } });
  }
  const now = new Date().toISOString();
  const payload = {
    _id: `msg_${Date.now()}`,
    message: message || "",
    files,
    createdAt: now,
    conversation: { _id: convo_id },
  };
  return res.status(201).json(payload);
});
router.get("/:convo_id", (req, res) => {
  // Frontend expects an array of messages for a conversation
  res.json([]);
});

router.post("/:convo_id", (req, res) => {
  const { message } = req.body || {};
  const { convo_id } = req.params;
  const now = new Date().toISOString();
  const payload = {
    _id: `msg_${Date.now()}`,
    message: message || "",
    files: [],
    createdAt: now,
    conversation: { _id: convo_id },
  };
  res.status(201).json(payload);
});

router.get("/starred", (req, res) => {
  res.json({ message: "Starred messages", messages: [] });
});

router.delete("/:message_id", (req, res) => {
  res.json({ message: "Message deleted" });
});

router.patch("/:message_id/star", (req, res) => {
  res.json({ message: "Message starred" });
});

export default router;
