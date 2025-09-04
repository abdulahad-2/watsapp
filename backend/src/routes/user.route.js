import express from "express";

const router = express.Router();

// Simple search route
router.get("/search", (req, res) => {
  res.json({ message: "User search endpoint working", users: [] });
});

export default router;
