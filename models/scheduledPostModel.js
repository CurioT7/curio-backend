const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const scheduledPostSchema = new Schema({
    title: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["post", "poll", "media", "link"],
    },
    content: {
      type: String,
    },
    authorName: {
      type: String,
      required: true,
      ref: "User",
    },
    views: {
      type: Number,
      default: 0,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    searchCount: {
      type: Number,
      default: 0,
    },
    upvotes: {
      type: Number,
      default: 0,
    },
    downvotes: {
      type: Number,
      default: 0,
    },
    linkedSubreddit: {
      type: Schema.Types.ObjectId,
      ref: "Subreddit",
    },
    comments: [
      {
        type: Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
    shares: {
      type: Number,
      default: 0,
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
    isCrosspost: {
      type: Boolean,
      default: false,
    },
    awards: {
      type: Number,
      default: 0,
    },
    media: {
      type: String,
    },
    link: {
      type: String,
    },
    isDraft: {
      type: Boolean,
      default: false,
    },
    isSaved: {
      type: Boolean,
      default: false,
    },
    originalPostId: {
      type: Schema.Types.ObjectId,
      ref: "Post",
    },
    sendReplies: {
      type: Boolean,
      default: false,
    },
    options: [
      {
        name: String,
        votes: {
          type: Number,
          default: 0,
        },
        voters: [
          {
            type: Schema.Types.ObjectId,
            ref: "User",
            default: [],
          },
        ],
      },
    ],
  
    voteLength: {
      type: Number,
    },
    isLocked: {
      type: Boolean,
      default: false,
    },
    isScheduled: {
      type: Boolean, 
      default: true 
      },
    scheduledPublishDate:
    {
      type: Date,
      default: null,
    },
    repeatOption: {
      type: String,
      enum: ["does_not_repeat", "hourly", "daily", "weekly", "monthly", "custom"],
      default: "does_not_repeat",
    },
    contestMode:{
      type: Boolean,
      default: false,
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
    scheduledTime: {
        type: Date,
    },
      timeToPublish: {
        type: Number, 
    },
  });

const ScheduledPost = mongoose.model("scheduledPost",scheduledPostSchema);

module.exports = ScheduledPost;
