import express from "express";
import trimRequest from "trim-request";
import authMiddleware from "../middlewares/authMiddleware.js";
import { sendMessage, getMessages, deleteMessage, starMessage, getStarredMessages } from "../controllers/message.controller.js";
const router = express.Router();

router.route("/").post(trimRequest.all, authMiddleware, sendMessage);
router.route("/starred").get(trimRequest.all, authMiddleware, getStarredMessages);
router.route("/:convo_id").get(trimRequest.all, authMiddleware, getMessages);
router.route("/:message_id").delete(trimRequest.all, authMiddleware, deleteMessage);
router.route("/:message_id/star").patch(trimRequest.all, authMiddleware, starMessage);
export default router;
