const mongoose = require("mongoose");

const memberSchema = mongoose.Schema({
  userID: {
    type: String,
    ref: "User",
  }
});

const moderatorSchema = mongoose.Schema({
  userID: {
    type: String,
    ref: "User",
  },
  role: {
    type: String,
    enum: ["creator", "moderator"],
  },
});

const communitySchema = mongoose.Schema({
  _id: {
    type: String,
  },
  createdAt: {
    type: Date,
    required: [true, "missing the date of creation of the user"],
    default: Date.now(),
  },
  members: [
    {
      type: memberSchema,
    },
  ],
  moderators: [
    {
      type: moderatorSchema,
    },
  ],
 
});



const Community = mongoose.model("Community", communitySchema);

module.exports = Community;
