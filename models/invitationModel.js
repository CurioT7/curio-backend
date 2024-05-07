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
});

const Invitation = mongoose.model("Invitation", invitationSchema);

module.exports = Invitation;
