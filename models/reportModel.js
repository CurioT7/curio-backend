/**
 * Defines the schema for the report model in the database.
 * @module postModel
 * @requires mongoose
 */

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

/**
 * Mongoose schema for a user report.
 * @typedef {Object} UserReportSchema
 * @property {String} reporterUsername - The username of the user who reported the item.
 * @property {String} reportedUsername - The username of the reported user.
 * @property {String} reportType - The type of the reported item.
 * @property {String} itemID - The ID of the reported item.
 * @property {String} linkedSubreddit - The subreddit linked to the reported item (if applicable).
 * @property {mongoose.Schema.Types.ObjectId} linkedItem - The ID of the linked item.
 * @property {String} linkedItemType - The type of the linked item (Post, Comment, or User).
 * @property {String} reportReason - The reason for the report.
 * @property {String} reportDetails - Additional details provided in the report.
 * @property {Boolean} isIgnored - Indicates whether the report has been ignored.
 * @property {Boolean} isViewed - Indicates whether the report has been viewed.
 */

/**
 * Mongoose model for user reports.
 * @type {UserReportModel}
 */
const userReportSchema = new Schema({
  reporterUsername: {
    type: String,
    required: true,
  },
  reportedUsername: {
    type: String,
    required: true,
  },
  reportType: {
    type: String,
    required: true,
    enum: [
      "username",
      "display name",
      "profile image",
      "banner image",
      "bio",
      "post",
      "comment",
    ],
  },
  linkedSubreddit: {
    type: String,
    default: null,
    ref: "Subreddit",
  },
  linkedItem: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: "linkedItemType",
    default: null,
  },
  linkedItemType: {
    type: String,
    enum: ["Post", "Comment", "User"],
  },
  reportReason: {
    type: String,
    required: true,
    enum: [
      "rule break",
      "harassment",
      "threatening violence",
      "hate",
      "minor abuse or sexualization",
      "sharing personal information",
      "non-consensual intimate media",
      "prohibited transaction",
      "impersonation",
      "copyright violation",
      "trademark violation",
      "self-harm or suicide",
      "spam",
      "contributer program violation",
    ],
  },
  reportDetails: {
    type: String,
  },
  isIgnored: {
    type: Boolean,
    default: false,
  },
  isViewed: {
    type: Boolean,
    default: false,
  },
});

/**
 * Represents a collection of user reports.
 * @type {mongoose.Model<UserReport>}
 */
const UserReports = mongoose.model("UserReports", userReportSchema);

module.exports = UserReports;
