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

// Create a new community
router.post("/", trimRequest.all, authMiddleware, createCommunity);

// Get all communities for logged-in user
router.get("/", trimRequest.all, authMiddleware, getCommunities);

// Join a community
router.post("/:community_id/join", trimRequest.all, authMiddleware, joinCommunity);

// Leave a community
router.post("/:community_id/leave", trimRequest.all, authMiddleware, leaveCommunity);

export default router;
