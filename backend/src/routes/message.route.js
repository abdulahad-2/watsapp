import express from "express";

const router = express.Router();

// Simple message routes
router.get("/:convo_id", (req, res) => {
  res.json({ message: "Messages retrieved", messages: [] });
});

router.post("/:convo_id", (req, res) => {
  res.json({ message: "Message sent", messageData: {} });
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
