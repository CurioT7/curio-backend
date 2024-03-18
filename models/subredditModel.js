/**
 * Defines the schema for the Subreddit model in the database.
 * @module subredditModel
 * @requires mongoose
 */

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

/**
 * Schema definition for a subreddit.
 * @typedef {object} SubredditSchema
 * @property {string} name - The name of the subreddit.
 * @property {string} description - The description of the subreddit.
 * @property {Date} createdAt - The creation date of the subreddit.
 * @property {mongoose.Types.ObjectId} creator - The ID of the user who created the subreddit.
 * @property {mongoose.Types.ObjectId[]} members - The IDs of users who are members of the subreddit.
 * @property {mongoose.Types.ObjectId[]} posts - The IDs of posts belonging to the subreddit.
 * @property {string} [banner] - The URL of the subreddit banner image.
 * @property {string} [icon] - The URL of the subreddit icon image.
 * @property {boolean} [isOver18=false] - Indicates if the subreddit is for users over 18 years old.
 * @property {boolean} [isPrivate=false] - Indicates if the subreddit is private.
 * @property {boolean} [isNSFW=false] - Indicates if the subreddit contains NSFW content.
 * @property {boolean} [isSpoiler=false] - Indicates if the subreddit allows spoiler content.
 * @property {boolean} [isOC=false] - Indicates if the subreddit allows original content.
 * @property {boolean} [isCrosspost=false] - Indicates if crossposting is allowed in the subreddit.
 * @property {string[]} [rules] - Array of subreddit rules.
 * @property {string} [category="General"] - The category of the subreddit.
 * @property {string} [language="English"] - The primary language used in the subreddit.
 * @property {boolean} [allowImages=true] - Indicates if images are allowed in posts.
 * @property {boolean} [allowVideos=true] - Indicates if videos are allowed in posts.
 * @property {boolean} [allowText=true] - Indicates if text posts are allowed.
 * @property {boolean} [allowLink=true] - Indicates if link posts are allowed.
 * @property {boolean} [allowPoll=true] - Indicates if polls are allowed in posts.
 * @property {boolean} [allowEmoji=true] - Indicates if emojis are allowed in posts.
 * @property {boolean} [allowGif=true] - Indicates if GIFs are allowed in posts.
 * @property {string} [role] - The role of the user in the subreddit (moderator, admin, member).
 */

/**
 * Creates a model for the Subreddit schema.
 * @type {mongoose.Model<SubredditSchema>}
 */
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

const subredditSchema = new Schema({
  name: {
    type: String,
    required: true,
    minlength: 3,
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
    enum: [
      "moderator",
      "admin",
      "member",
    ],
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

/**
 * Creates a model for the Subreddit schema.
 * @type {mongoose.Model}
 */
const Subreddit = mongoose.model("Subreddit", subredditSchema);

module.exports = Subreddit;
