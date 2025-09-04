import express from "express";

const router = express.Router();

// Simple conversation routes
router.post("/", (req, res) => {
  res.json({ message: "Conversation created", conversation: {} });
});

router.get("/", (req, res) => {
  res.json([]);
});

router.post("/group", (req, res) => {
  res.json({ message: "Group created", group: {} });
});

export default router;
