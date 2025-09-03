const mongoose = require("mongoose");
require("dotenv").config();

async function fixBrokenConversations() {
  try {
    await mongoose.connect(process.env.DATABASE_URL);
    console.log("🔗 Connected to MongoDB");

    const db = mongoose.connection.db;
    const conversations = db.collection("conversations");
    const messages = db.collection("messages");

    const brokenConvos = await conversations
      .find({ isGroup: false, users: { $size: 1 } })
      .toArray();

    console.log(`🔍 Found ${brokenConvos.length} broken conversations`);

    let fixed = 0;
    for (const convo of brokenConvos) {
      console.log(`\n🔧 Fixing conversation ${convo._id}`);

      const convoMessages = await messages
        .find({ conversation: convo._id }) // no double wrap
        .toArray();

      if (convoMessages.length > 0) {
        const senderIds = [...new Set(convoMessages.map((msg) => msg.sender.toString()))];
        console.log(`   📨 Found ${convoMessages.length} messages from ${senderIds.length} senders`);

        if (senderIds.length >= 2) {
          const objectIds = senderIds.slice(0, 2).map((id) => mongoose.Types.ObjectId(id));

          const result = await conversations.updateOne(
            { _id: convo._id },
            { $addToSet: { users: { $each: objectIds } } } // union instead of overwrite
          );

          if (result.modifiedCount > 0) {
            console.log(`   ✅ Fixed! Added users: ${senderIds.slice(0, 2)}`);
            fixed++;
          }
        } else {
          console.log(`   ❌ Only ${senderIds.length} unique sender(s) - cannot fix`);
        }
      } else {
        console.log(`   ❌ No messages found - deleting empty conversation`);
        await conversations.deleteOne({ _id: convo._id });
      }
    }

    console.log(`\n🎉 Fixed ${fixed} conversations!`);
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

fixBrokenConversations();
