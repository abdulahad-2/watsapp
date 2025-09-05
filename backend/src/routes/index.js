import express from "express";
import authRoutes from "./auth.route.js";
import userRoutes from "./user.route.js";
import conversationRoutes from "./conversation.route.js";
import messageRoutes from "./message.route.js";
import communityRoutes from "./community.route.js";
import aiRoutes from "./ai.route.js";
import adminRoutes from "./admin.route.js";

const router = express.Router();

// Root route
router.get("/", (req, res) => {
  res.json({ message: "WhatsApp Clone Backend API is running!" });
});

// Auth routes
router.use("/auth", authRoutes);

// User routes
router.use("/users", userRoutes);
router.use("/api/v1/user", userRoutes);

// Conversation routes
router.use("/conversations", conversationRoutes);
router.use("/conversation", conversationRoutes);

// Message routes
router.use("/messages", messageRoutes);

// Community routes
router.use("/communities", communityRoutes);

// AI routes
router.use("/ai", aiRoutes);

// Admin routes (protected by ADMIN_SECRET header)
router.use("/admin", adminRoutes);

export default router;
