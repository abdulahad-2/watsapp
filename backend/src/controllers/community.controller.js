import createHttpError from "http-errors";
import logger from "../configs/logger.config.js";
import CommunityModel from "../models/communityModel.js";
import { findUser } from "../services/user.service.js";

export const createCommunity = async (req, res, next) => {
  try {
    const admin_id = req.user.userId;
    const { name, description, isPrivate } = req.body;

    if (!name) {
      throw createHttpError.BadRequest("Community name is required.");
    }

    const communityData = {
      name,
      description: description || "",
      isPrivate: isPrivate || false,
      admin: admin_id,
      members: [admin_id],
      moderators: [admin_id],
    };

    const newCommunity = await CommunityModel.create(communityData);
    const populatedCommunity = await CommunityModel.findById(newCommunity._id)
      .populate("admin", "name picture email")
      .populate("members", "name picture email")
      .populate("moderators", "name picture email");

    res.status(201).json(populatedCommunity);
  } catch (error) {
    next(error);
  }
};

export const getCommunities = async (req, res, next) => {
  try {
    const user_id = req.user.userId;
    
    const communities = await CommunityModel.find({
      members: user_id
    })
    .populate("admin", "name picture email")
    .populate("members", "name picture email")
    .populate("moderators", "name picture email")
    .sort({ updatedAt: -1 });

    res.json(communities);
  } catch (error) {
    next(error);
  }
};

export const joinCommunity = async (req, res, next) => {
  try {
    const user_id = req.user.userId;
    const { community_id } = req.params;

    const community = await CommunityModel.findById(community_id);
    if (!community) {
      throw createHttpError.NotFound("Community not found");
    }

    if (community.members.includes(user_id)) {
      throw createHttpError.BadRequest("Already a member of this community");
    }

    community.members.push(user_id);
    await community.save();

    const updatedCommunity = await CommunityModel.findById(community_id)
      .populate("admin", "name picture email")
      .populate("members", "name picture email")
      .populate("moderators", "name picture email");

    res.json(updatedCommunity);
  } catch (error) {
    next(error);
  }
};

export const leaveCommunity = async (req, res, next) => {
  try {
    const user_id = req.user.userId;
    const { community_id } = req.params;

    const community = await CommunityModel.findById(community_id);
    if (!community) {
      throw createHttpError.NotFound("Community not found");
    }

    if (community.admin.toString() === user_id) {
      throw createHttpError.BadRequest("Admin cannot leave the community");
    }

    community.members = community.members.filter(member => member.toString() !== user_id);
    community.moderators = community.moderators.filter(mod => mod.toString() !== user_id);
    await community.save();

    res.json({ message: "Left community successfully" });
  } catch (error) {
    next(error);
  }
};
