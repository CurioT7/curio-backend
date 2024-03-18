const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const { hashPassword } = require("../utils/passwords");

const Schema = mongoose.Schema;

/**
 * Represents a user in the Reddit clone application.
 * @typedef {Object} User
 * @property {string} username - The unique username of the user.
 * @property {string} email - The unique email address of the user.
 * @property {string} password - The hashed password of the user.
 * @property {Date} cakeDay - The registration date of the user.
 * @property {number} goldAmount - The amount of gold the user has.
 * @property {string} banner - The URL of the user's banner image.
 * @property {string} profilePic - The URL of the user's profile picture.
 * @property {string} bio - The bio/description of the user.
 * @property {Array<Object>} socialLinks - Array containing objects with platform and URL fields representing user's social links.
 * @property {string} displayName - The display name of the user.
 * @property {boolean} isover18 - Indicates whether the user is over 18.
 * @property {Array<string>} comments - Array containing ObjectIds of comments made by the user.
 * @property {Array<string>} posts - Array containing ObjectIds of posts made by the user.
 * @property {Array<Object>} upvotes - Array containing objects with itemId and itemType fields representing posts or comments upvoted by the user.
 * @property {Array<Object>} downvotes - Array containing objects with itemId and itemType fields representing posts or comments downvoted by the user.
 * @property {Array<string>} followers - Array containing usernames of users following the user.
 * @property {Array<string>} followings - Array containing usernames of users followed by the user.
 * @property {Array<Object>} subreddits - Array containing objects with subreddit and role fields representing subreddits the user is a member of, with roles like moderator or admin.
 */
// const moderatorSchema = new mongoose.Schema({
//   subreddit: {
//     type: String,
//     ref: "Subreddit",
//   },
//   role: {
//     type: String,
//     enum: ["creator", "moderator"],
//   },
// });
// const memberSchema = new mongoose.Schema({
//   subreddit: {
//     type: String,
//     ref: "Subreddit",
//   },
// });
//create user schema for reddit user
const userSchema = new mongoose.Schema({
  googleId: {
    type: String,
    trim: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  password: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  gender: {
    type: String,
    required: false,
  },
  language: {
    type: String,
    required: false,
  },
  cakeDay: {
    type: Date,
    default: Date.now,
    get: function (date) {
      // Format the date as "Month Day, Year"
      return new Date(date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    },
  },
  goldAmount: {
    type: Number,
    default: 0,
  },
  banner: {
    type: String,
  },
  profilePicture: {
    type: String,
  },
  bio: {
    type: String,
  },
  socialLinks: [
    {
      platform: String,
      url: String,
    },
  ],
  displayName: {
    type: String,
  },
  isOver18: {
    type: Boolean,
    default: false,
  },
  comments: [
    {
      type: Schema.Types.ObjectId,
      ref: "Comment",
    },
  ],
  posts: [
    {
      type: Schema.Types.ObjectId,
      ref: "Post",
    },
  ],
  upvotes: [
    {
      itemId: {
        type: Schema.Types.ObjectId,
        required: true,
      },
      itemType: {
        type: String,
        required: true,
        default: 0,
        enum: ["Post", "Comment"],
      },
    },
  ],
  downvotes: [
    {
      itemId: {
        type: Schema.Types.ObjectId,
        required: true,
      },
      itemType: {
        type: String,
        required: true,
        default: 0,
        enum: ["Post", "Comment"],
      },
    },
  ],
  followers: [
    {
      type: String,
    },
  ],
  followings: [
    {
      type: String,
    },
  ],
  subreddits: [
    {
      subreddit: {
        type: String,
        ref: "Subreddit",
      },
      role: {
        type: String,
        enum: ["moderator", "creator"],
        default: "member",
      },
    },
  ],
  member: [
    {
      subreddit: {
        type: String,
        ref: "Subreddit",
      },
    },
  ],
  moderators: [
    {
      subreddit: {
        type: String,
        ref: "Subreddit",
      },
      role: {
        type: String,
        enum: ["creator", "moderator"],
      },
    },
  ],
});

/**
 * Hashes the password before saving the user to the database.
 * @param {Function} next - Callback function.
 * @returns {Promise<void>} - Promise that resolves when hashing is done.
 */
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  try {
    const hashedPassword = await hashPassword(this.password);
    this.password = hashedPassword;
    next();
  } catch (error) {
    next(error);
  }
});

const User = mongoose.model("User", userSchema);

module.exports = User;
