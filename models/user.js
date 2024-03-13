const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const { hashPassword } = require("../utils/passwords");

const memberSchema = new mongoose.Schema({
    communityId: {
      type: String ,
      ref: "Community"
    }
  });
const moderatorSchema = new mongoose.Schema({
    communityId: {
      type: String,
      ref: "Community"
    },
    role: {
      type: String,
      enum: ["creator", "moderator"]
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
    avatar: {
        type: String,
        default: "default.jpg"
    },
    about: {
        type: String,
      },
    friendRequestToMe: {
        type: String,
          ref: "User"
    },
    friendRequestFromMe: 
    {
      type: String,
          ref: "User"
    },
    friend: 
    {
      type: String,
      ref: "User"
    },
    member:
    {
      type: memberSchema,
    },
      
    moderators: 
    {
      type: moderatorSchema,
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