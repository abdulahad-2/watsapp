import logger from "../configs/logger.config.js";
import { updateLatestMessage } from "../services/conversation.service.js";
import {
  createMessage,
  getConvoMessages,
  populateMessage,
} from "../services/message.service.js";
import MessageModel from "../models/messageModel.js";
import ConversationModel from "../models/conversationModel.js";

export const sendMessage = async (req, res, next) => {
  try {
    const user_id = req.user.userId;
    const { message, convo_id, files } = req.body;
    if (!convo_id || (!message && !files)) {
      logger.error("Please provider a conversation id and a message body");
      return res.sendStatus(400);
    }
    const msgData = {
      sender: user_id,
      message,
      conversation: convo_id,
      files: files || [],
    };
    let newMessage = await createMessage(msgData);
    let populatedMessage = await populateMessage(newMessage._id);
    await updateLatestMessage(convo_id, newMessage);
    res.json(populatedMessage);
  } catch (error) {
    next(error);
  }
};
export const getMessages = async (req, res, next) => {
  try {
    const convo_id = req.params.convo_id;
    if (!convo_id) {
      logger.error("Please add a conversation id in params.");
      res.sendStatus(400);
    }
    const messages = await getConvoMessages(convo_id);
    res.json(messages);
  } catch (error) {
    next(error);
  }
};

export const deleteMessage = async (req, res, next) => {
  try {
    const user_id = req.user.userId;
    const message_id = req.params.message_id;
    const { convo_id } = req.body;
    
    if (!message_id || !convo_id) {
      logger.error("Message ID and conversation ID are required");
      return res.sendStatus(400);
    }

    const message = await MessageModel.findById(message_id);
    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    if (message.sender.toString() !== user_id) {
      return res.status(403).json({ error: "You can only delete your own messages" });
    }

    await MessageModel.findByIdAndUpdate(message_id, { deleted: true });
    res.json({ success: true, messageId: message_id });
  } catch (error) {
    next(error);
  }
};

export const starMessage = async (req, res, next) => {
  try {
    const message_id = req.params.message_id;
    
    if (!message_id) {
      logger.error("Message ID is required");
      return res.sendStatus(400);
    }

    const message = await MessageModel.findById(message_id);
    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    const updatedMessage = await MessageModel.findByIdAndUpdate(
      message_id, 
      { starred: !message.starred }, 
      { new: true }
    ).populate("sender", "name picture email status")
     .populate("conversation");

    res.json(updatedMessage);
  } catch (error) {
    next(error);
  }
};

export const getStarredMessages = async (req, res, next) => {
  try {
    const user_id = req.user.userId;
    
    const starredMessages = await MessageModel.find({ 
      starred: true,
      $or: [
        { sender: user_id },
        { 
          conversation: { 
            $in: await ConversationModel.find({ users: user_id }).select('_id') 
          }
        }
      ]
    })
    .populate("sender", "name picture email status")
    .populate("conversation", "name picture isGroup")
    .sort({ createdAt: -1 });

    res.json(starredMessages);
  } catch (error) {
    next(error);
  }
};
