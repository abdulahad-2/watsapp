import express from "express";
import trimRequest from "trim-request";
import authMiddleware from "../middlewares/authMiddleware.js";
import { 
  createCommunity, 
  getCommunities, 
  joinCommunity, 
  leaveCommunity 
} from "../controllers/community.controller.js";

const router = express.Router();

router.route("/").post(trimRequest.all, authMiddleware, createCommunity);
router.route("/").get(trimRequest.all, authMiddleware, getCommunities);
router.route("/:community_id/join").post(trimRequest.all, authMiddleware, joinCommunity);
router.route("/:community_id/leave").post(trimRequest.all, authMiddleware, leaveCommunity);

export default router;
