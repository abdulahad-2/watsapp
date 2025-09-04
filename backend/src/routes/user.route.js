import express from "express";

const router = express.Router();

// User search route - supports both /search and query params
router.get("/search", (req, res) => {
  const { search } = req.query;
  res.json([]);
});

// Also handle GET / with search query for /api/v1/user?search=
router.get("/", (req, res) => {
  const { search } = req.query;
  res.json([]);
});

export default router;
