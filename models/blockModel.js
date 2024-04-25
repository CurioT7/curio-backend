/**
 * Mongoose model for user blocking relationships.
 * @module models/block
 */

const mongoose = require("mongoose");

/**
 * Schema definition for a user blocking relationship.
 * @typedef {Object} BlockSchema
 * @property {mongoose.Types.ObjectId} blockerId - The ID of the user who is blocking.
 * @property {mongoose.Types.ObjectId} blockedId - The ID of the user who is being blocked.
 * @property {Date} unblockTimestamp - The date and time when the user was unblocked.
 */

/**
 * Schema definition for a user blocking relationship.
 * @type {BlockSchema}
 */

const blockSchema = new mongoose.Schema({
    blockerId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User' 
    },
    blockedId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User' 
    },
    unblockTimestamp: {
      type: Date,
      default: null // Set to null initially if a user hasn't been unblocked yet
    },
    blockedUsername: {
      type: String
    }
});

//  a unique compound index on blockerId and blockedId to enforce unique blocking relationships
blockSchema.index({ blockerId: 1, blockedId: 1 }, { unique: true });

/**
 * Mongoose model for user blocking relationships.
 * @type {mongoose.Model}
 */

const block = mongoose.model("block", blockSchema);
module.exports = block;
