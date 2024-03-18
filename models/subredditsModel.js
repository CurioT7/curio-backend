const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const memberSchema = mongoose.Schema({
  username: {
    type: String,
    ref: "User",
  },
});

const moderatorSchema = mongoose.Schema({
  username: {
    type: String,
    ref: "User",
  },
  role: {
    type: String,
    enum: ["creator", "moderator"],
  },
});

//create user schema for reddit user
const subredditSchema = new Schema({
  name: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 21,
    unique: true,
  },
  description: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  creator: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  members: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  posts: [
    {
      type: Schema.Types.ObjectId,
      ref: "Post",
    },
  ],
  banner: {
    type: String,
  },
  icon: {
    type: String,
  },
  isOver18: {
    type: Boolean,
    default: false,
  },
  isPrivate: {
    type: Boolean,
    default: false,
  },
  isNSFW: {
    type: Boolean,
    default: false,
  },
  isSpoiler: {
    type: Boolean,
    default: false,
  },
  isOC: {
    type: Boolean,
    default: false,
  },
  isCrosspost: {
    type: Boolean,
    default: false,
  },
  rules: [
    {
      type: String,
    },
  ],
  category: {
    type: String,
    default: "General",
  },
  language: {
    type: String,
    default: "English",
  },
  allowImages: {
    type: Boolean,
    default: true,
  },
  allowVideos: {
    type: Boolean,
    default: true,
  },
  allowText: {
    type: Boolean,
    default: true,
  },
  allowLink: {
    type: Boolean,
    default: true,
  },
  allowPoll: {
    type: Boolean,
    default: true,
  },
  allowEmoji: {
    type: Boolean,
    default: true,
  },
  allowGif: {
    type: Boolean,
    default: true,
  },
  role: {
    type: String,
    enum: ["moderator", "admin", "member"],
  },
  members: [
    {
      type: memberSchema,
    },
  ],
  moderators: [
    {
      type: moderatorSchema,
    },
  ],
});
const Subreddit = mongoose.model("Subredddit", subredditSchema);

module.exports = Subreddit;
