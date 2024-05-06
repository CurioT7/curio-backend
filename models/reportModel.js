/**
 * Defines the schema for the report model in the database.
 * @module postModel
 * @requires mongoose
 */

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

/**
 * Represents a user report.
 * @typedef {Object} UserReport
 * @property {string} reportedUsername - The username being reported.
 * @property {string} reportType - The type of report. Must be one of: "username", "profile image", "banner image", "bio".
 * @property {string} reportReason - The reason for the report. Must be one of the following: "harassment", "threatening violence", "hate", "minor abuse or sexualization", "sharing personal information", "non-consensual intimate media", "prohibited transaction", "impersonation", "copyright violation", "trademark violation", "self-harm or suicide", "spam".
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
  itemID: {
    type: String,
    default: null,
  },
  linkedSubreddit: {
    type: String,
    default: null,
    ref: "Subreddit",
  },
  linkedItem: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: "linkedItemType", // Dynamically determine the referenced model
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
