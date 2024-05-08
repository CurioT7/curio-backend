/**
 * Defines the schema for the Post model in the database.
 * @module postModel
 * @requires mongoose
 */

const mongoose = require("mongoose");
// const { options } = require("../router/profileRouter");
const Schema = mongoose.Schema;

/**
 * Schema definition for a post.
 * @typedef {Object} PostSchema
 * @property {string} title - The title of the post.
 * @property {string} content - The content of the post.
 * @property {string} authorName - The name of the author of the post.
 * @property {mongoose.Types.ObjectId} authorID - The ID of the author of the post.
 * @property {Date} createdAt - The date and time when the post was created.
 * @property {number} searchCount - The number of searchCount the post has received.
 * @property {number} upvotes - The number of upvotes the post has received.
 * @property {number} downvotes - The number of downvotes the post has received.
 * @property {mongoose.Types.ObjectId} belongsTo - The ID of the subreddit to which the post belongs.
 * @property {mongoose.Types.ObjectId[]} comments - An array of comment IDs associated with the post.
 * @property {number} shares - The number of shares the post has received.
 * @property {boolean} isNSFW - Indicates whether the post is Not Safe For Work (NSFW).
 * @property {boolean} isSpoiler - Indicates whether the post contains spoilers.
 * @property {boolean} isOC - Indicates whether the post is Original Content (OC).
 * @property {boolean} isCrosspost - Indicates whether the post is a crosspost.
 * @property {number} awards - The number of awards the post has received.
 * @property {string} media - The media associated with the post (e.g., image or video URL).
 * @property {string} link - The external link associated with the post.
 * @property {boolean} isDraft - Indicates whether the post is a draft.
 */

/**
 * Schema definition for a post.
 * @type {PostSchema}
 */
const postSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["post", "poll", "media", "link"],
  },
  content: {
    type: String,
  },
  authorName: {
    type: String,
    required: true,
    ref: "User",
  },
  views: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  searchCount: {
    type: Number,
    default: 0,
  },
  upvotes: {
    type: Number,
    default: 0,
  },
  downvotes: {
    type: Number,
    default: 0,
  },
  linkedSubreddit: {
    type: Schema.Types.ObjectId,
    ref: "Subreddit",
  },
  comments: [
    {
      type: Schema.Types.ObjectId,
      ref: "Comment",
    },
  ],
  shares: {
    type: Number,
    default: 0,
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
  awards: {
    type: Number,
    default: 0,
  },
  media: {
    type: String,
  },
  link: {
    type: String,
  },
  isDraft: {
    type: Boolean,
    default: false,
  },
  isSaved: {
    type: Boolean,
    default: false,
  },
  originalPostId: {
    type: Schema.Types.ObjectId,
    ref: "Post",
  },
  sendReplies: {
    type: Boolean,
    default: false,
  },
  options: [
    {
      name: String,
      votes: {
        type: Number,
        default: 0,
      },
      voters: [
        {
          type: Schema.Types.ObjectId,
          ref: "User",
          default: [],
        },
      ],
    },
  ],

  voteLength: {
    type: Number,
  },
  isLocked: {
    type: Boolean,
    default: false,
  },
  isScheduled: {
    type: Boolean, 
    default: false 
    },
  scheduledPublishDate:
  {
    type: Date,
    default: null,
  },
  repeatOption: {
    type: String,
    enum: ["does_not_repeat", "hourly", "daily", "weekly", "monthly", "custom"],
    default: "does_not_repeat",
  },
  contestMode:{
    type: Boolean,
    default: false,
  },
  isEdited: {
    type: Boolean,
    default: false,
  },
  isReportApproved: {
    type: Boolean,
    default: false,
  },
  isApprovedForShare:{
    type: Boolean,
    default: false,
  },
});

// Define a virtual property to calculate karma
postSchema.virtual("karma").get(function () {
  return this.upvotes - this.downvotes;
});

/**
 * Creates a model for the Post schema.
 * @type {mongoose.Model}
 */
const Post = mongoose.model("Post", postSchema);

module.exports = Post;
