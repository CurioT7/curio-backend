const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const messageSchema = new Schema({
  sender: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  recipient: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  recipientSubreddit: {
    type: Schema.Types.ObjectId,
    ref: "Subreddit",
  },
  postId: {
    type: Schema.Types.ObjectId,
    ref: "Post",
  },
  linkedSubreddit: {
    type: Schema.Types.ObjectId,
    ref: "Subreddit",
  },
  commentId: {
    type: Schema.Types.ObjectId,
    ref: "Comment",
  },
  commentNumber: {
    type: Number,
  },
  senderSubreddit: {
    type: Schema.Types.ObjectId,
    ref: "Subreddit",
  },
  type: {
    type: String,
    enum: ["message", "userMention", "postReply"],
  },
  subject: {
    type: String,
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
});

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;
