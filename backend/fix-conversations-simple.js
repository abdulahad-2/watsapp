const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

async function fixConversations() {
  const client = new MongoClient(process.env.DATABASE_URL);

  try {
    await client.connect();
    console.log('🔗 Connected to MongoDB');

    const db = client.db();
    const conversations = db.collection('conversations');
    const messages = db.collection('messages');

    const brokenConvos = await conversations.find({
      isGroup: false,
      users: { $size: 1 }
    }).toArray();

    console.log(`🔍 Found ${brokenConvos.length} broken conversations`);

    for (const convo of brokenConvos) {
      console.log(`\n🔧 Fixing convo ${convo._id}`);

      const convoMessages = await messages.find({
        conversation: convo._id
      }).toArray();

      if (convoMessages.length === 0) {
        console.log(`❌ No messages → deleting convo ${convo._id}`);
        await conversations.deleteOne({ _id: convo._id });
        continue;
      }

      // Get unique sender IDs (as ObjectIds)
      const senderIds = [...new Set(convoMessages.map(msg => msg.sender.toString()))]
        .map(id => new ObjectId(id));

      console.log(`   📨 Found ${senderIds.length} unique senders`);

      if (senderIds.length >= 2) {
        await conversations.updateOne(
          { _id: convo._id },
          { $set: { users: senderIds } } // keep all unique senders
        );
        console.log(`✅ Updated users: ${senderIds}`);
      } else {
        console.log(`❌ Only 1 unique sender → cannot fix`);
      }
    }

    console.log('\n🎉 Fix completed');
  } catch (error) {
    console.error('💀 Error:', error);
  } finally {
    await client.close();
  }
}

fixConversations();
