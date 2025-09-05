import express from "express";
import { createClient } from "@supabase/supabase-js";

const router = express.Router();

// Env
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ADMIN_SECRET = process.env.ADMIN_SECRET;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.warn("[admin.route] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Admin routes will not function.");
}

// Middleware to protect admin routes
router.use((req, res, next) => {
  const header = req.headers["x-admin-secret"];
  if (!ADMIN_SECRET || header !== ADMIN_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
});

// DELETE /admin/auth/users/:id -> delete Supabase Auth user by UUID
router.delete("/auth/users/:id", async (req, res) => {
  try {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return res.status(500).json({ error: "Supabase admin not configured" });
    }
    const userId = req.params.id;
    if (!userId) return res.status(400).json({ error: "Missing user id" });

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (error) return res.status(500).json({ error: error.message });

    return res.json({ message: `User ${userId} deleted` });
  } catch (e) {
    return res.status(500).json({ error: e?.message || "Failed to delete user" });
  }
});

export default router;
