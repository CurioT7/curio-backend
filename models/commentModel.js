/**
 * Defines the schema for the Comment model in the database.
 * @module CommentModel
 * @requires mongoose
 */

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

/**
 * Schema definition for a comment.
 * @type {Schema}
 */
const commentSchema = new Schema({
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
  linkedPost: {
    type: Schema.Types.ObjectId,
    ref: "Post",
  },
  karma: {
    type: Number,
    default: 0,
  },
  awards: {
    type: Number,
    default: 0,
  },
});

/**
 * Creates a model for the Comment schema.
 * @type {mongoose.Model}
 */
const Comment = mongoose.model("Comment", commentSchema);

module.exports = Comment;
