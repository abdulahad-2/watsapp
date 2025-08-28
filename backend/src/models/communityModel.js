import mongoose from "mongoose";
const { ObjectId } = mongoose.Schema.Types;

const communitySchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Community name is required."],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    picture: {
      type: String,
      default: process.env.DEFAULT_GROUP_PICTURE,
    },
    isPrivate: {
      type: Boolean,
      default: false,
    },
    admin: {
      type: ObjectId,
      ref: "UserModel",
      required: true,
    },
    moderators: [
      {
        type: ObjectId,
        ref: "UserModel",
      },
    ],
    members: [
      {
        type: ObjectId,
        ref: "UserModel",
      },
    ],
    groups: [
      {
        type: ObjectId,
        ref: "ConversationModel",
      },
    ],
    announcements: [
      {
        type: ObjectId,
        ref: "MessageModel",
      },
    ],
  },
  {
    collection: "communities",
    timestamps: true,
  }
);

const CommunityModel =
  mongoose.models.CommunityModel ||
  mongoose.model("CommunityModel", communitySchema);

export default CommunityModel;
