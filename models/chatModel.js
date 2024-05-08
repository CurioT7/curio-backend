const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const chatSchema = new Schema({
  participants: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  messages: [
    {
      sender: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
      message: {
        type: String,
      },
      media: {
        type: String,
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
      status: {
        type: String,
        enum: ["sent", "delivered", "read"],
        default: "sent",
      },
    },
  ],
  timestamp: {
    type: Date,
    default: Date.now,
  },
  isGroupChat: {
    type: Boolean,
    default: false,
  },
  isPendingRequest: {
    type: Boolean,
    default: false,
  },
});

const Chat = mongoose.model("Chat", chatSchema);

module.exports = Chat;
