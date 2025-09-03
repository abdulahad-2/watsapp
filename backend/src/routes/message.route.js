import express from "express";
import trimRequest from "trim-request";
import authMiddleware from "../middlewares/authMiddleware.js";
import {
  sendMessage,
  getMessages,
  deleteMessage,
  starMessage,
  getStarredMessages,
} from "../controllers/message.controller.js";

const router = express.Router();

// Messages inside a conversation
router
  .route("/:convo_id")
  .get(trimRequest.all, authMiddleware, getMessages)   // Get all messages from a conversation
  .post(trimRequest.all, authMiddleware, sendMessage); // Send a new message to a conversation

// Starred messages
router.route("/starred").get(trimRequest.all, authMiddleware, getStarredMessages);

// Single message actions
router
  .route("/:message_id")
  .delete(trimRequest.all, authMiddleware, deleteMessage); // Delete a message

router
  .route("/:message_id/star")
  .patch(trimRequest.all, authMiddleware, starMessage);   // Star/unstar a message

export default router;
