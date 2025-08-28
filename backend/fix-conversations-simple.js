const { MongoClient } = require('mongodb');
require('dotenv').config();

async function fixConversations() {
  const client = new MongoClient(process.env.DATABASE_URL);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db();
    const conversations = db.collection('conversations');
    const messages = db.collection('messages');
    
    // Find conversations with only 1 user
    const brokenConvos = await conversations.find({
      isGroup: false,
      users: { $size: 1 }
    }).toArray();
    
    console.log(`Found ${brokenConvos.length} broken conversations`);
    
    for (const convo of brokenConvos) {
      console.log(`\nFixing conversation ${convo._id}`);
      console.log(`Current users: ${convo.users.length}`);
      
      // Find messages in this conversation
      const convoMessages = await messages.find({
        conversation: convo._id
      }).toArray();
      
      if (convoMessages.length > 0) {
        // Get unique sender IDs
        const senderIds = [...new Set(convoMessages.map(msg => msg.sender.toString()))];
        console.log(`Found ${senderIds.length} unique senders`);
        
        if (senderIds.length >= 2) {
          // Update conversation with both users
          await conversations.updateOne(
            { _id: convo._id },
            { $set: { users: senderIds.slice(0, 2) } }
          );
          console.log(`✅ Updated conversation with users: ${senderIds.slice(0, 2)}`);
        } else {
          console.log(`❌ Only found ${senderIds.length} unique sender(s)`);
        }
      } else {
        console.log(`❌ No messages found for conversation ${convo._id}`);
      }
    }
    
    console.log('\n✅ Fix completed');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

fixConversations();
