import createHttpError from "http-errors";
import logger from "../configs/logger.config.js";
import {
  createConversation,
  doesConversationExist,
  getUserConversations,
  populateConversation,
} from "../services/conversation.service.js";
import { findUser } from "../services/user.service.js";

export const create_open_conversation = async (req, res, next) => {
  try {
    const sender_id = req.user.userId;
    const { receiver_id, isGroup, convo_id } = req.body;
    
    // Handle group conversations
    if (isGroup && convo_id) {
      const existingGroup = await populateConversation(convo_id, "users admin", "name email picture status");
      if (existingGroup) {
        return res.json(existingGroup);
      } else {
        logger.error("Group conversation not found");
        throw createHttpError.BadRequest("Group conversation not found");
      }
    }
    
    // Handle existing conversations by convo_id (when receiver_id is null)
    if (!receiver_id && convo_id && !isGroup) {
      const existingConvo = await populateConversation(convo_id, "users", "name email picture status");
      if (existingConvo) {
        // Check if conversation has both users, if not, fix it
        if (existingConvo.users.length === 1) {
          logger.warn(`Conversation ${convo_id} only has 1 user, needs fixing`);
          // For now, return error to force recreation
          throw createHttpError.BadRequest("Incomplete conversation data");
        }
        return res.json(existingConvo);
      } else {
        logger.error("Conversation not found");
        throw createHttpError.BadRequest("Conversation not found");
      }
    }
    
    // Handle regular conversations
    if (!receiver_id) {
      throw createHttpError.BadRequest("receiver_id is required for non-group conversations");
    }
    const existedConversation = await doesConversationExist(
      sender_id,
      receiver_id
    );
    if (existedConversation) {
      res.json(existedConversation);
    } else {
      let reciever_user = await findUser(receiver_id);
      let convoData = {
        name: reciever_user.name,
        picture: reciever_user.picture,
        isGroup: false,
        users: [sender_id, receiver_id],
      };
      const newConvo = await createConversation(convoData);
      const populatedConvo = await populateConversation(
        newConvo._id,
        "users",
        "-password"
      );
      console.log('Created conversation with users:', populatedConvo.users?.map(u => u._id));
      res.status(200).json(populatedConvo);
    }
  } catch (error) {
    next(error);
  }
};

export const getConversations = async (req, res, next) => {
  try {
    const user_id = req.user.userId;
    const conversations = await getUserConversations(user_id);
    res.status(200).json(conversations);
  } catch (error) {
    next(error);
  }
};
export const createGroup = async (req, res, next) => {
  const { name, users } = req.body;
  //add current user to users
  users.push(req.user.userId);
  if (!name || !users) {
    throw createHttpError.BadRequest("Please fill all fields.");
  }
  if (users.length < 2) {
    throw createHttpError.BadRequest(
      "Atleast 2 users are required to start a group chat."
    );
  }
  let convoData = {
    name,
    users,
    isGroup: true,
    admin: req.user.userId,
    picture: process.env.DEFAULT_GROUP_PICTURE,
  };
  try {
    const newConvo = await createConversation(convoData);
    const populatedConvo = await populateConversation(
      newConvo._id,
      "users admin",
      "-password"
    );
    res.status(200).json(populatedConvo);
  } catch (error) {
    next(error);
  }
};
