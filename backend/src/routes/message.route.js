import express from "express";
import { createClient } from "@supabase/supabase-js";

const router = express.Router();

// Optional Supabase client (lightweight, free tier friendly)
let supabase = null;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY; // anon key is fine for basic inserts with RLS
if (SUPABASE_URL && SUPABASE_KEY) {
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    console.log("✅ Supabase client initialized for messages");
  } catch (e) {
    console.warn("⚠️ Supabase init failed for messages:", e?.message || e);
    supabase = null;
  }
}

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
  // Broadcast to conversation room so other side receives instantly
  try {
    const io = req.app.get("io");
    if (io) io.to(convo_id).emit("receive message", payload);
  } catch (_) {}

  // Optionally persist to Supabase
  (async () => {
    if (!supabase) return;
    try {
      await supabase.from("messages").insert({
        id: payload._id,
        convo_id,
        text: payload.message,
        files: payload.files,
        created_at: now,
      });
    } catch (e) {
      console.warn("Supabase insert message failed:", e?.message || e);
    }
  })();

  return res.status(201).json(payload);
});
router.get("/:convo_id", async (req, res) => {
  // Frontend expects an array of messages for a conversation
  const { convo_id } = req.params;
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("messages")
        .select("id, convo_id, text, files, created_at")
        .eq("convo_id", convo_id)
        .order("created_at", { ascending: true });
      if (error) throw error;
      const mapped = (data || []).map((m) => ({
        _id: m.id,
        message: m.text,
        files: m.files || [],
        createdAt: m.created_at,
        conversation: { _id: m.convo_id },
      }));
      return res.json(mapped);
    } catch (e) {
      console.warn("Supabase fetch messages failed:", e?.message || e);
    }
  }
  return res.json([]);
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
  try {
    const io = req.app.get("io");
    if (io) io.to(convo_id).emit("receive message", payload);
  } catch (_) {}

  (async () => {
    if (!supabase) return;
    try {
      await supabase.from("messages").insert({
        id: payload._id,
        convo_id,
        text: payload.message,
        files: payload.files,
        created_at: now,
      });
    } catch (e) {
      console.warn("Supabase insert message failed:", e?.message || e);
    }
  })();

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
