const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const communitySettingsSchema = new Schema({
  name: {
    type: String,
    required: true,
    ref: "Subreddit",
  },
  description: {
    type: String,
    required: true,
    ref: "Subreddit",
  },
  welcomeMessage: {
    type: Boolean,
    default: false,
  },
  privacyMode: {
    type: String,
    enum: ["private", "public", "restricted"],
  },
  isNSFW: {
    type: Boolean,
    default: false,
  },
  posts: {
    type: String,
    enum: ["Any", "Links Only", "Text Posts Only"],
  },
  isSpoiler: {
    type: Boolean,
    default: true,
  },
  allowsCrossposting: {
    type: Boolean,
    default: true,
  },
  archivePosts: {
    type: Boolean,
    default: false,
  },
  allowImages: {
    type: Boolean,
    default: true,
  },
  allowMultipleImages: {
    type: Boolean,
    default: true,
  },
  allowPolls: {
    type: Boolean,
    default: true,
  },
  postSpamFilterStrength: {
    type: String,
    enum: ["Low", "High", "All"],
    default: "High",
  },
  commentSpamFilterStrength: {
    type: String,
    enum: ["Low", "High", "All"],
    default: "Low",
  },
  linksSpamFilterStrength: {
    type: String,
    enum: ["Low", "High", "All"],
    default: "High",
  },
  commentsSort: {
    type: String,
    enum: ["None", "Best", "Old", "Q&A", "New", "Top", "Controversial"],
    default: "New",
  },
  collapseDeletedComments: {
    type: Boolean,
    default: false,
  },
  commentScoreHide: {
    type: Number,
    default: 0,
  },
  allowGifComment: {
    type: Boolean,
    default: true,
  },
  allowImageComment: {
    type: Boolean,
    default: true,
  },
  allowCollectibleExpressions: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  banner: {
    type: String,
  },
  avatar: {
    type: String,
  },
  mod: {
    type: [Schema.Types.ObjectId],
    ref: "User",
  },
});

const CommunitySettings = mongoose.model("CommunitySettings", communitySettingsSchema);
module.exports = CommunitySettings;

