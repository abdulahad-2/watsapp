import express from "express";
import trimRequest from "trim-request";
import authMiddleware from "../middlewares/authMiddleware.js";
import {
  createGroup,
  create_open_conversation,
  getConversations,
} from "../controllers/conversation.controller.js";

const router = express.Router();

// Create/open a one-to-one conversation
router.post("/", trimRequest.all, authMiddleware, create_open_conversation);

// Get all conversations for logged-in user
router.get("/", trimRequest.all, authMiddleware, getConversations);

// Create a group conversation
router.post("/group", trimRequest.all, authMiddleware, createGroup);

export default router;
