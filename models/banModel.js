/**
 * Mongoose schema for a ban entry.
 * @typedef {Object} BanSchema
 * @property {String} bannedUsername - The username of the banned user.
 * @property {String} violation - The reason for the ban.
 * @property {String} modNote - Additional notes from the moderator.
 * @property {String} userMessage - A message to be sent to the banned user.
 * @property {String} bannedBy - The role of the user who issued the ban (moderator or admin).
 */

/**
 * Mongoose model for bans.
 * @typedef {Object} BanModel
 * @property {Function} find - Finds bans based on the provided query.
 * @property {Function} findOne - Finds a single ban based on the provided query.
 * @property {Function} create - Creates a new ban entry.
 */

/**
 * Mongoose model for bans.
 * @type {BanModel}
 */

const mongoose = require("mongoose");

const banSchema = new mongoose.Schema({
  bannedUsername: {
    type: String,
    ref: "User",
  },
  violation: {
    type: String,
  },
  modNote: {
    type: String,
  },
  userMessage: {
    type: String,
  },
  bannedBy: {
    type: String,
    enum: ["moderator", "admin"],
  },
});

const ban = mongoose.model("ban", banSchema);
module.exports = ban;
