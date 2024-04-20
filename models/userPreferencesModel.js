/**
 * Defines the schema for user preferences.
 * @module UserPreferences
 * @requires mongoose
 */

const mongoose = require("mongoose");

/**
 * Schema definition for user preferences.
 * @typedef {Object} UserPreferencesSchema
 * @property {string} username - The username of the user.
 * @property {string} gender - The gender preference of the user.
 * @property {string} language - The language preference of the user.
 * @property {string} locationCustomization - The location preference of the user.
 * @property {string} displayName - The display name of the user.
 * @property {string} about - Information about the user.
 * @property {string} socialLinks - Links to the user's social profiles.
 * @property {Object} images - URLs of the user's profile picture and banner.
 * @property {boolean} NSFW - Whether NSFW content is allowed.
 * @property {boolean} allowFollow - Whether others can follow the user.
 * @property {boolean} contentVisibility - Whether the user's content is visible.
 * @property {boolean} activeInCommunityVisibility - Whether the user's activity in communities is visible.
 * @property {boolean} clearHistory - Whether to clear user's history.
 * @property {Array} block - List of blocked users.
 * @property {Array} viewBlockedPeople - List of people the user has blocked.
 * @property {Array} mute - List of muted communities.
 * @property {Array} viewMutedCommunities - List of muted communities.
 * @property {boolean} adultContent - Whether adult content is allowed.
 * @property {boolean} autoplayMedia - Whether media should autoplay.
 * @property {boolean} communityThemes - Whether community themes are enabled.
 * @property {string} communityContentSort - Sorting preference for community content.
 * @property {string} globalContentView - Global content view preference.
 * @property {Object} rememberPerCommunity - Preferences to remember per community.
 * @property {boolean} rememberPerCommunity.rememberContentSort - Whether to remember content sort per community.
 * @property {boolean} rememberPerCommunity.rememberContentView - Whether to remember content view per community.
 * @property {boolean} openPostsInNewTab - Whether to open posts in a new tab.
 * @property {boolean} mentions - Whether to receive mentions notifications.
 * @property {boolean} comments - Whether to receive comments notifications.
 * @property {boolean} upvotes - Whether to receive upvotes notifications.
 * @property {boolean} replies - Whether to receive replies notifications.
 * @property {boolean} newFollowers - Whether to receive new followers notifications.
 * @property {boolean} postsYouFollow - Whether to receive notifications for posts you follow.
 * @property {boolean} newFollowerEmail - Whether to receive new follower emails.
 * @property {boolean} chatRequestEmail - Whether to receive chat request emails.
 * @property {boolean} unsubscribeFromAllEmails - Whether to unsubscribe from all emails.
 */

/**
 * Schema definition for user preferences.
 * @type {UserPreferencesSchema}
 */

const userPreferencesSchema = new mongoose.Schema({
  username: {
    type: String,
    ref: "User",
    required: true,
  },
  gender: {
    type: String,
    enum: ["woman", "man", "i prefer not to say"],
  },
  language: {
    type: String,
    enum: [
      "Deutsch",
      "English(us)",
      "Espanol(es)",
      "Espanol(mx)",
      "Francias",
      "Italiano",
      "portugues(br)",
      "portugues(pt)",
    ],
    default: "English(us)",
  },
  locationCustomization: {
    type: String,
    default: "No Location specified.",
  },
  displayName: {
    type: String,
  },
  about: {
    type: String,
  },
  socialLinks: [
    {
      displayName: String,
      url: String,
      platform: String,
    },
  ],
  banner: {
    type: String,
  },
  profilePicture: {
    type: String,
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
  viewBlockedPeople: [
    {
      username: { type: String, ref: "block" },
      blockTimestamp: { type: Date, default: Date.now },
    },
  ],
  viewMutedCommunities: [
    {
      communityName: {
        type: String,
        ref: "subredditModel",
      },
    },
  ],
  adultContent: {
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
    },
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
  upvotesPosts: {
    type: Boolean,
    default: true,
  },
  upvotesComments: {
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

/**
 * Mongoose model for user preferences.
 * @type {mongoose.Model}
 */

const UserPreferences = mongoose.model(
  "UserPreferences",
  userPreferencesSchema
);

module.exports = UserPreferences;
