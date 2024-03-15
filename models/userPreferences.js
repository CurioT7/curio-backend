const mongoose = require("mongoose");

const userPreferencesSchema = new mongoose.Schema({
  username: {
    type: String,
    ref: 'User',
    required: true,
  },
  gender: { 
    type: String,
    enum : ["woman", "man", "non-binary", "i prefer not to say"]
  },
  language: {
    type: String,
    enum :["de", "en", "es", "fr", "it", "ja", "ko", "nl", "pl", "pt", "ru", "zh", "zh-TW"],
    default: "en"
  },
  displayName: {
    type: String,
  },
  about: {
    type: String,
  },
  socialLinks: {
    type: String,
  },
  images: {
    pfp: { type: String },
    banner: { type: String },
  },
  NSFW: {
    type: Boolean,
    default: false,
  },
  allowFollow: {
    type: Boolean,
    default: true,
  },
  contentVisibility: {
    type: Boolean,
    default: true,
  },
  activeInCommunityVisibility: {
    type: Boolean,
    default: true,
  },
  clearHistory: {
    type: Boolean,
    default: false,
  },
  block: [{
    username: { type: String },
  }],
  viewBlockedPeople: [{
    username: { type: String },
  }],
  mute: [{
    username: { type: String },
  }],
  viewMutedCommunities: [{
    communityId: { type: String }, // Reference community model if applicable
  }],
  adultContent:{
    type: Boolean,
    default: false,
  },
  autoplayMedia: {
    type: Boolean,
    default: true,
  },
  communityThemes: {
    type: Boolean,
    default: true,
  },
  communityContentSort: {
    type: String,
    default: "hot",
  },
  globalContentView: {
    type: String,
    default: "card",
  },
  rememberPerCommunity: {
    rememberContentSort: {
      type: Boolean,
      default: false,
    },
    rememberContentView: {
      type: Boolean,
      default: false,
    }
  },
  openPostsInNewTab: {
    type: Boolean,
    default: false,
  },
  mentions: {
    type: Boolean,
    default: true,
  },
  comments: {
    type: Boolean,
    default: true,
  },
  upvotes: {
    type: Boolean,
    default: true,
  },
  replies: {
    type: Boolean,
    default: true,
  },
  newFollowers: {
    type: Boolean,
    default: true,
  },
  invitations: {
    type: Boolean,
    default: true,
  },
  postsYouFollow: {
    type: Boolean,
    default: true,
  },
  newFollowerEmail: {
    type: Boolean,
    default: true,
  },
  chatRequestEmail: {
    type: Boolean,
    default: true,
  },
  unsubscribeFromAllEmails: {
    type: Boolean,
    default: false,
  },
});

  
const UserPreferences = mongoose.model("UserPreferences", userPreferencesSchema);
module.exports = UserPreferences;
