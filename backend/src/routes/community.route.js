import express from "express";

const router = express.Router();

// Simple community routes
router.post("/", (req, res) => {
  res.json({ message: "Community created", community: {} });
});

router.get("/", (req, res) => {
  res.json({ message: "Communities retrieved", communities: [] });
});

router.post("/:community_id/join", (req, res) => {
  res.json({ message: "Joined community" });
});

router.post("/:community_id/leave", (req, res) => {
  res.json({ message: "Left community" });
});

export default router;
