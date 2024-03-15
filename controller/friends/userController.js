const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const User = require("../../models/user");
const Community = require("../../models/subredditsModel");
const CommunityService = require("../../services/communityService");
const UserService = require("../../services/userService");
const brypt = require("bcrypt");
require("dotenv").config();
const communityServiceRequest = new CommunityService(Community);
const userServiceRequest = new UserService(User);
/**
 * friend request to add friendship or moderator_deInvite
 * @param {function} (req,res)
 * @returns {object} res
 */
async function friendRequest(req, res) {
  const username = req.body.username;
  const friendname = req.body.friendUsername; // Corrected variable name

  try {
    // Check if the requesting user exists in the database
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({
        status: "failed",
        message: "User not found",
      });
    }

    // Check if the user to be followed exists in the database
    const friend = await User.findOne({ username: friendname });

    if (!friend) {
      return res.status(404).json({
        status: "failed",
        message: "User to be followed not found",
      });
    }

    // Proceed with the friend request
    await userServiceRequest.addFriend(username, friendname); // Use correct variables

    return res.status(200).json({
      status: "success",
      message: "Friend added successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: "failed",
      message: "An error occurred while adding friend",
    });
  }
}

/**
 * unfriend request to remove friendship or moderator_deInvite
 * @param {function} (req,res)
 * @returns {object} res
 */
async function unFriendRequest(req, res){
    const username = req.body.username;
    const friendname = req.body.friendUsername; // Corrected variable name
  
    try {
      // Check if the requesting user exists in the database
      const user = await User.findOne({ username });
  
      if (!user) {
        return res.status(404).json({
          status: "failed",
          message: "User not found",
        });
      }
  
      // Check if the user to be followed exists in the database
      const friend = await User.findOne({ username: friendname });
  
      if (!friend) {
        return res.status(404).json({
          status: "failed",
          message: "User to be deleted not found",
        });
      }
  
      // Proceed with the friend request
      await userServiceRequest.deleteFriend(username, friendname); // Use correct variables
  
      return res.status(200).json({
        status: "success",
        message: "Friend deleted successfully",
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        status: "failed",
        message: "An error occurred while adding friend",
      });
    }
  }
  


async function getUserInfo(req, res){
  const username = req.body.username;
  const user = await User.findOne({ username });
  if (!user) {
    return res.status(404).json({
      status: "failed",
      message: "not found this user",
    });
  } else {
    return res.status(200).json({
      id: user._id,
      username: user.username,
      about: user.about,
      avatar: user.avatar,
    });
  }
};
  

async function followSubreddit(req, res) {
  try {
    // Follow subreddit
    await userServiceRequest.followSubreddits(req.body.username, req.body.communityName);

    // Check if the subreddit exists
    const subreddit = await communityServiceRequest.availableSubreddit(req.body.communityName);
    if (subreddit.state) {
      return res.status(404).json({
        status: "failed",
        message: "Subreddit not found",
      });
    }

    // Check if the requesting user is a moderator in the subreddit
    const isModerator = await userServiceRequest.isModeratorInSubreddit(req.body.communityName, req.body.username);
    if (!isModerator) {
      return res.status(400).json({
        status: "failed",
        message: "You are not a moderator in this subreddit",
      });
    }

    // Check if the user to be invited as a moderator is not already a moderator
    const isAlreadyModerator = await userServiceRequest.isModeratorInSubreddit(req.body.communityName, req.body.userID);
    if (isAlreadyModerator) {
      return res.status(400).json({
        status: "failed",
        message: "This user is already a moderator",
      });
    }

    // Invite the user as a moderator
    await communityServiceRequest.inviteModerator(req.body.communityName, req.body.userID);

    return res.status(200).json({
      status: "succeeded",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: "failed",
      message: "An error occurred",
    });
  }
}

async function unFollowSubreddit(req, res) {
  try {
    // Unfollow subreddit
    await userServiceRequest.unFollowSubreddits(req.body.username, req.body.communityName);

    // Check if the subreddit exists
    const subreddit = await communityServiceRequest.availableSubreddit(req.body.communityName);
    if (subreddit.state) {
      return res.status(404).json({
        status: "failed",
        message: "Subreddit not found",
      });
    }

    // Check if the requesting user is a moderator in the subreddit
    const isModerator = await userServiceRequest.isModeratorInSubreddit(req.body.communityName, req.username);
    if (!isModerator) {
      return res.status(400).json({
        status: "failed",
        message: "You are not a moderator in this subreddit",
      });
    }

    // Check if the user to be uninvited as a moderator is already invited
    const isInvited = await communityServiceRequest.isInvited(req.body.communityName, req.body.userID);
    if (!isInvited) {
      return res.status(400).json({
        status: "failed",
        message: "This user is not invited",
      });
    }

    // Uninvite the user as a moderator
    await communityServiceRequest.deInviteModerator(req.body.communityName, req.body.userID);

    return res.status(200).json({
      status: "succeeded",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: "failed",
      message: "An error occurred",
    });
  }
}



module.exports = { 
  friendRequest,
  unFriendRequest,
  getUserInfo,
  followSubreddit,
  unFollowSubreddit,
 };