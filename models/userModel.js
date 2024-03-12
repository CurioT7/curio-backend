const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const { hashPassword } = require("../utils/passwords");

const Schema = mongoose.Schema;

//create user schema for reddit user
const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  password: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  goldAmount: {
    type: Number,
    default: 0,
  },
  banner: {
    type: String,
  },
  profilePic: {
    type: String,
  },
  bio: {
    type: String,
  },
  socialLinks: [
    {
      platform: String,
      url: String,
    },
  ],
  displayName: {
    type: String,
  },
  isover18: {
    type: Boolean,
    default: false,
  },
  comments: [
    {
      type: Schema.Types.ObjectId,
      ref: "Comment",
    },
  ],
  posts: [
    {
      type: Schema.Types.ObjectId,
      ref: "Post",
    },
  ],
  upvotes: [
    {
      itemId: {
        type: Schema.Types.ObjectId,
        required: true,
      },
      itemType: {
        type: String,
        required: true,
        default: 0,
        enum: ["Post", "Comment"],
      },
    },
  ],
  downvotes: [
    {
      itemId: {
        type: Schema.Types.ObjectId,
        required: true,
      },
      itemType: {
        type: String,
        required: true,
        default: 0,
        enum: ["Post", "Comment"],
      },
    },
  ],
  followers: [
    {
      type: Schema.Types.ObjectId,
      ref: "Followers",
    },
  ],
  following: [
    {
      type: Schema.Types.ObjectId,
      ref: "Following",
    },
  ],
});

// Hash the password before saving the user to the database
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  try {
    const hashedPassword = await hashPassword(this.password);
    this.password = hashedPassword;
    next();
  } catch (error) {
    next(error);
  }
});

const User = mongoose.model("User", userSchema);

module.exports = User;
