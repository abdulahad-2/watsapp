const mongoose = require('mongoose');
require('dotenv').config();

async function fixBrokenConversations() {
  try {
    await mongoose.connect(process.env.DATABASE_URL);
    console.log('🔗 Connected to MongoDB');
    
    const db = mongoose.connection.db;
    const conversations = db.collection('conversations');
    const messages = db.collection('messages');
    
    // Find conversations with only 1 user
    const brokenConvos = await conversations.find({
      isGroup: false,
      users: { $size: 1 }
    }).toArray();
    
    console.log(`🔍 Found ${brokenConvos.length} broken conversations`);
    
    let fixed = 0;
    let deleted = 0;
    
    for (const convo of brokenConvos) {
      console.log(`\n🔧 Processing conversation ${convo._id}`);
      console.log(`   Current user: ${convo.users[0]}`);
      
      // Get messages for this conversation to find the other participant
      const convoMessages = await messages.find({
        conversation: mongoose.Types.ObjectId(convo._id)
      }).toArray();
      
      if (convoMessages.length > 0) {
        // Get unique sender IDs
        const senderIds = [...new Set(convoMessages.map(msg => msg.sender.toString()))];
        console.log(`   📨 Found ${convoMessages.length} messages from ${senderIds.length} unique senders`);
        
        if (senderIds.length >= 2) {
          // Update conversation with both users
          const result = await conversations.updateOne(
            { _id: convo._id },
            { $set: { users: senderIds.slice(0, 2).map(id => mongoose.Types.ObjectId(id)) } }
          );
          
          if (result.modifiedCount > 0) {
            console.log(`   ✅ Fixed! Added users: ${senderIds.slice(0, 2)}`);
            fixed++;
          }
        } else {
          console.log(`   ❌ Only 1 unique sender - deleting broken conversation`);
          await conversations.deleteOne({ _id: convo._id });
          await messages.deleteMany({ conversation: convo._id });
          deleted++;
        }
      } else {
        console.log(`   ❌ No messages found - deleting empty conversation`);
        await conversations.deleteOne({ _id: convo._id });
        deleted++;
      }
    }
    
    console.log(`\n🎉 Summary:`);
    console.log(`   ✅ Fixed: ${fixed} conversations`);
    console.log(`   🗑️  Deleted: ${deleted} broken conversations`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

fixBrokenConversations();
