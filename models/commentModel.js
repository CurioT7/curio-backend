/**
 * Defines the schema for the Comment model in the database.
 * @module CommentModel
 * @requires mongoose
 */

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

/**
 * Schema definition for a comment.
 * @typedef {Object} CommentSchema
 * @property {string} content - The content of the comment.
 * @property {string} authorName - The name of the author of the comment.
 * @property {mongoose.Types.ObjectId} authorID - The ID of the author of the comment.
 * @property {Date} createdAt - The date and time when the comment was created.
 * @property {number} upvotes - The number of upvotes the comment has received.
 * @property {number} downvotes - The number of downvotes the comment has received.
 * @property {mongoose.Types.ObjectId} linkedPost - The ID of the post to which the comment is linked.
 * @property {number} awards - The number of awards the comment has received.
 */

/**
 * Schema definition for a comment.
 * @type {CommentSchema}
 */
const commentSchema = new Schema({
  content: {
    type: String,
    required: true,
  },
  authorName: {
    type: String,
    required: true,
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
  linkedPost: {
    type: Schema.Types.ObjectId,
    ref: "Post",
  },
  linkedSubreddit: {
    type: Schema.Types.ObjectId,
    ref: "Subreddit",
  },
  awards: {
    type: Number,
    default: 0,
  },
  isEdited: {
    type: Boolean,
    default: false,
  },
  isReportApproved: {
    type: Boolean,
    default: false,
  },
  isRemoved: {
    type: Boolean,
    default: false,
  },
});
// Define a virtual property to calculate karma
commentSchema.virtual("karma").get(function () {
  return this.upvotes - this.downvotes;
});

/**
 * Creates a model for the Comment schema.
 * @type {mongoose.Model}
 */
const Comment = mongoose.model("Comment", commentSchema);

module.exports = Comment;
