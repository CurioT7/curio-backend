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
  reportedUsername: {
    type: String,
    required: true,
  },
  reportType: {
    type: String,
    enum: ["username", "profile image", "banner image", "bio"],
  },
  reportReason: {
    type: String,
    enum: [
      "harassment",
      "threatening violence",
      "hate",
      "minor abuse or sexualization",
      "sharing personal informtion",
      "non-consensual intimate media",
      "prohibited transaction",
      "impersonation",
      "copyright violation",
      "trademark violation",
      "self-harm or suicide",
      "spam",
    ],
  },
});

/**
 * Represents a collection of user reports.
 * @type {mongoose.Model<UserReport>}
 */
const UserReports = mongoose.model("UserReports", userReportSchema);

module.exports = UserReports;
