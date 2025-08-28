import mongoose from 'mongoose';
import { ConversationModel } from './src/models/index.js';
import { MessageModel } from './src/models/index.js';
import dotenv from 'dotenv';

dotenv.config();

const fixConversations = async () => {
  try {
    await mongoose.connect(process.env.DATABASE_URL);
    console.log('Connected to MongoDB');

    // Find conversations with only 1 user
    const incompleteConvos = await ConversationModel.find({
      isGroup: false,
      $expr: { $eq: [{ $size: "$users" }, 1] }
    });

    console.log(`Found ${incompleteConvos.length} conversations with only 1 user`);

    for (const convo of incompleteConvos) {
      console.log(`\nFixing conversation ${convo._id}`);
      console.log(`Current users: ${convo.users}`);

      // Find messages in this conversation to get the other user
      const messages = await MessageModel.find({ 
        conversation: convo._id 
      }).populate('sender', '_id');

      if (messages.length > 0) {
        // Get all unique sender IDs from messages
        const senderIds = [...new Set(messages.map(msg => msg.sender._id.toString()))];
        console.log(`Message senders: ${senderIds}`);

        // Find the user not in the conversation
        const currentUserId = convo.users[0].toString();
        const otherUserId = senderIds.find(id => id !== currentUserId);

        if (otherUserId) {
          // Update conversation to include both users
          await ConversationModel.findByIdAndUpdate(convo._id, {
            users: [currentUserId, otherUserId]
          });
          console.log(`✅ Updated conversation to include users: [${currentUserId}, ${otherUserId}]`);
        } else {
          console.log(`❌ Could not find other user for conversation ${convo._id}`);
        }
      } else {
        console.log(`❌ No messages found for conversation ${convo._id}`);
      }
    }

    console.log('\n✅ Conversation fix completed');
    process.exit(0);
  } catch (error) {
    console.error('Error fixing conversations:', error);
    process.exit(1);
  }
};

fixConversations();
