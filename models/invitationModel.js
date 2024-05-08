const mongoose = require("mongoose");

const invitationSchema = new mongoose.Schema({
  sender: {
    type: String,
    required: true,
  },
  recipient: {
    type: String,
    required: true,
  },
  subreddit: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  manageUsers: {
    type: Boolean,
    default: false,
  },
  createLiveChats: {
    type: Boolean,
    default: false,
  },
  manageSettings: {
    type: Boolean,
    default: false,
  },
  managePostsAndComments: {
    type: Boolean,
    default: false,
  },
  everything: {
    type: Boolean,
    default: false,
  },
});

const Invitation = mongoose.model("Invitation", invitationSchema);

module.exports = Invitation;
