import express from "express";
import authRoutes from "./auth.route.js";
import userRoutes from "./user.route.js";
import conversationRoutes from "./conversation.route.js";
import messageRoutes from "./message.route.js";
import communityRoutes from "./community.route.js";

const router = express.Router();

// Auth routes
router.use("/auth", authRoutes);

// User routes
router.use("/users", userRoutes);

// Conversation routes
router.use("/conversations", conversationRoutes);

// Message routes
router.use("/messages", messageRoutes);

// Community routes
router.use("/communities", communityRoutes);

export default router;
