const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const { hashPassword } = require("../utils/passwords");
const Schema = mongoose.Schema;

const moderatorSchema = new mongoose.Schema({
  communityName: {
    type: String,
    ref: "Subredddit",
  },
  role: {
    type: String,
    enum: ["creator", "moderator"],
  },
});
const memberSchema = new mongoose.Schema({
  communityName: {
    type: String,
    ref: "Subredddit",
  },
});
//create user schema for reddit user
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }, 
    communityName: {
      type: String,
      defualt: "tata"
    },
    avatar: {
        type: String,
        default: "default.jpg"
    },
    about: {
        type: String,
        default: ""
      },
    friend: 
    {
      type: String,
      ref: "User"
    },
    followers: [
      {
        type: String,
      },
    ],
    followings: [
      {
        type: String,
      },
    ],
    subreddits: [
      {
        subreddit: {
          type: Schema.Types.ObjectId,
          ref: "Subreddit",
        },
        role: {
          type: String,
          enum: ["moderator", "admin"],
          default: "member",
        },
      },
    ],
    countSubreddits: [
      {
        type: String,
      },
    ],

    member: [
      {
        type: memberSchema,
      },
    ],
    moderators: [
      {
        type: moderatorSchema,
      },
    ],
    over18: {
      type: Boolean,
      default: true,
    }
});

  
// Hash the password before saving the user to the database
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }
    try {
        const hashedPassword = await hashPassword(this.password);
        this.password = hashedPassword;
        next();
    }
    catch (error) {
        next(error);
    }
});


  

const User = mongoose.model("User", userSchema);

module.exports = User;