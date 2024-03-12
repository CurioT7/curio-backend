/**
 * Defines the schema for the Post model in the database.
 * @module PostModel
 * @requires mongoose
 */

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

/**
 * Schema definition for a post.
 * @type {Schema}
 */
const postSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  authorName: {
    type: String,
    required: true,
  },
  authorID: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  upvotes: {
    type: Number,
    default: 0,
  },
  downvotes: {
    type: Number,
    default: 0,
  },
  belongsTo: {
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
  karma: {
    type: Number,
    default: 0,
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
});

/**
 * Creates a model for the Post schema.
 * @type {mongoose.Model}
 */
const Post = mongoose.model("Post", postSchema);

module.exports = Post;
