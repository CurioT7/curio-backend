/**
 * Defines the schema for the Insight model in the database.
 * @module insightModel
 * @requires mongoose
 */
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

/**
 * Schema definition for an insight related to Reddit.
 * @typedef {object} InsightSchema
 * @property {string} title - The title of the insight.
 * @property {string} content - The content of the insight.
 * @property {Date} createdAt - The creation date of the insight.
 * @property {mongoose.Types.ObjectId} author - The ID of the user who authored the insight.
 * @property {string} subreddit - The name of the subreddit related to the insight.
 * @property {number} upvotes - The number of upvotes received by the insight.
 * @property {number} comments - The number of comments received by the insight.
 */

/**
 * Creates a model for the Reddit Insight schema.
 * @type {mongoose.Model<InsightSchema>}
 */
const InsightSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  subreddit: {
    type: String,
    ref: "Subreddit",
    required: true,
  },
  upvotes: {
    type: Number,
    default: 0,
  },
  comments: {
    type: Number,
    default: 0,
  },
});

/**
 * Creates a model for the Reddit Insight schema.
 * @type {mongoose.Model}
 */
const RedditInsight = mongoose.model("Insight", InsightSchema);

module.exports = RedditInsight;
