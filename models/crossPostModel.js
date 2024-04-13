const { auth } = require("firebase-admin");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const crossPostSchema = new Schema({
  linkedPost: {
    type: Schema.Types.ObjectId,
    ref: "Post",
    required: true,
  },
  linkedSubreddit: {
    type: Schema.Types.ObjectId,
    ref: "Subreddit",
  },
  authorID: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
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
});

module.exports = mongoose.model("CrossPost", crossPostSchema);
