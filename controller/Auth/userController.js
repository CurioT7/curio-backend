const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const User = require("../../models/user");
const Community = require("../../models/communityModel");
const CommunityService = require("../../services/communityService");
const catchAsync = require("../../utils/catchAsync");
const UserService = require("../../services/userService");


const brypt = require("bcrypt");
require("dotenv").config();
const communityServiceRequest = new CommunityService(Community);
const userServiceRequest = new UserService(User);


const  { hashPassword, comparePassword } = require("../../utils/passwords");

async function signUp(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { username, email, password } = req.body;
    //check if user already exists
    const userExist = await User.findOne({ username });
    if (userExist) {
        return res.status(409).json({ 
            success :false,
            message: "Username already exists" });
    }
    try{
        const user = new User({ username, email, password });
        //save user to database
        await user.save();
        //status
        return res.status(201).json({ 
            success: true,
            message: "User created successfully" });
    }
    catch (error) {
        return res.status(500).json({ 
            success: false,
            message: error.message });
    }
};
const friendRequest = catchAsync(async (req, res) => {
  if (req.body.type === "friend") {
    userServiceRequest.addFriend(req.username, req.body.userID);
  } else if (req.body.type === "moderator_invite") {
    //[1]-> check the existence of the moderator
    var subreddit = await communityServiceRequest.availableSubreddit(
      req.body.communityID
    );
    if (subreddit.state) {
      return res.status(404).json({
        status: "failed",
        message: "not found this subreddit",
      });
    }
    // [2] -> check if user isn't moderator in subreddit
    if (
      !(await userServiceRequest.isModeratorInSubreddit(
        req.body.communityID,
        req.username
      ))
    ) {
      return res.status(400).json({
        status: "failed",
        message: "you aren't moderator in this subreddit",
      });
    }
    //check that invited moderator isn't moderator
    if (
      await userServiceRequest.isModeratorInSubreddit(
        req.body.communityID,
        req.body.userID
      )
    ) {
      return res.status(400).json({
        status: "failed",
        message: "this user is already moderator",
      });
    }
    await communityServiceRequest.inviteModerator(
      req.body.communityID,
      req.body.userID
    );
  } else {
    return res.status(400).json({
      status: "failed",
      message: "invalid type",
    });
  }
  return res.status(200).json({
    status: "succeeded",
  });
});
/**
 * unfriend request to remove friendship or moderator_deInvite
 * @param {function} (req,res)
 * @returns {object} res
 */
const unFriendRequest = catchAsync(async (req, res) => {
  if (req.body.type === "friend") {
    userServiceRequest.deleteFriend(req.username, req.body.userID);
  } else if (req.body.type === "moderator_deinvite") {
    //[1]-> check the existence of the moderator
    var subreddit = await communityServiceRequest.availableSubreddit(
      req.body.communityID
    );
    if (subreddit.state) {
      return res.status(404).json({
        status: "failed",
        message: "not found this subreddit",
      });
    }
    // [2] -> check if user isn't moderator in subreddit
    if (
      !(await userServiceRequest.isModeratorInSubreddit(
        req.body.communityID,
        req.username
      ))
    ) {
      return res.status(400).json({
        status: "failed",
        message: "you aren't moderator in this subreddit",
      });
    }
    //check that other user is invited
    if (
      !(await communityServiceRequest.isInvited(
        req.body.communityID,
        req.body.userID
      ))
    ) {
      return res.status(400).json({
        status: "failed",
        message: "this user is isn't invited",
      });
    }
    await communityServiceRequest.deInviteModerator(
      req.body.communityID,
      req.body.userID
    );
  } else {
    return res.status(400).json({
      status: "failed",
      message: "invalid type",
    });
  }
  return res.status(200).json({
    status: "succeeded",
  });
});

const getUserInfo = catchAsync(async (req, res) => {
  const user = await userServiceRequest.getOne({
    _id: req.params.username,
    select: "avatar _id about",
  });
  if (!user) {
    return res.status(404).json({
      status: "failed",
      message: "not found this user",
    });
  } else {
    return res.status(200).json({
      about: user.about,
      id: user._id,
      avatar: user.avatar,
    });
  }
});
    
module.exports = { 
  signUp,
  friendRequest,
  unFriendRequest,
  getUserInfo };