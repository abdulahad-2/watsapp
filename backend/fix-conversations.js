import mongoose from 'mongoose';
import { ConversationModel, MessageModel } from './src/models/index.js';
import dotenv from 'dotenv';

dotenv.config();

const fixConversations = async () => {
  try {
    await mongoose.connect(process.env.DATABASE_URL);
    console.log('🔗 Connected to MongoDB');

    const incompleteConvos = await ConversationModel.find({
      isGroup: false,
      $expr: { $eq: [{ $size: "$users" }, 1] }
    });

    console.log(`🔍 Found ${incompleteConvos.length} broken conversations`);

    for (const convo of incompleteConvos) {
      console.log(`\n🔧 Fixing convo ${convo._id}, users: ${convo.users}`);

      const messages = await MessageModel.find({ conversation: convo._id })
        .populate('sender', '_id');

      if (messages.length === 0) {
        console.log(`❌ No messages → deleting convo ${convo._id}`);
        await ConversationModel.findByIdAndDelete(convo._id);
        continue;
      }

      const senderIds = [...new Set(messages.map(msg => msg.sender._id.toString()))];
      console.log(`   📨 Senders: ${senderIds}`);

      const currentUserId = convo.users[0];
      const otherUserId = senderIds.find(id => id !== currentUserId.toString());

      if (otherUserId) {
        await ConversationModel.findByIdAndUpdate(
          convo._id,
          { $addToSet: { users: mongoose.Types.ObjectId(otherUserId) } }
        );
        console.log(`✅ Fixed convo: added ${otherUserId}`);
      } else {
        console.log(`❌ Could not find another user for ${convo._id}`);
      }
    }

    console.log('\n🎉 Conversation fix completed');
    process.exit(0);
  } catch (err) {
    console.error('💀 Error:', err);
    process.exit(1);
  }
};

fixConversations();
