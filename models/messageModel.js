const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const messageSchema = new Schema({
  sender: {
    type: String,
    ref: "User",
    required: true,
  },
  recipient: {
    type: String,
    ref: "User",
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  isSent: {
    type: Boolean,
    default: false,
  },
});

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;
