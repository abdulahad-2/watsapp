import express from "express";
import trimRequest from "trim-request";
import { searchUsers } from "../controllers/user.controller.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

// ✅ Search users → GET /users/search?query=ahad
router.route("/search").get(trimRequest.all, authMiddleware, searchUsers);

export default router;
