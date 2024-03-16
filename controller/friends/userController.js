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
  

async function unFollowSubreddit(req, res) {
  try {
    const { username, subreddit } = req.body; // Destructure username and subreddit from request body

    // Check if the username exists in the database
    const userExists = await User.findOne({ username });
    if (!userExists) {
      return res.status(404).json({
        status: "failed",
        message: "Username not found",
      });
    }

    // Check if the subreddit exists in the database
    const subredditExists = await Community.findOne({ name: subreddit });
    if (!subredditExists) {
      return res.status(404).json({
        status: "failed",
        message: "Subreddit not found",
      });
    }

    // Follow subreddit
    await userServiceRequest.unFollowSubreddits(username, subreddit);

    return res.status(200).json({
      status: "success",
      message: "Subreddit unfollowed successfully",
    });
  } catch (error) {
    console.error("Error unfollowing subreddit:", error);
    return res.status(500).json({
      status: "failed",
      message: "An error occurred while unfollowing subreddit",
    });
  }
}

async function followSubreddit(req, res) {
  try {
    const { username, subreddit } = req.body; // Destructure username and subreddit from request body

    // Check if the username exists in the database
    const userExists = await User.findOne({ username });
    if (!userExists) {
      return res.status(404).json({
        status: "failed",
        message: "Username not found",
      });
    }

    // Check if the subreddit exists in the database
    const subredditExists = await Community.findOne({ name: subreddit });
    if (!subredditExists) {
      return res.status(404).json({
        status: "failed",
        message: "Subreddit not found",
      });
    }

    // Follow subreddit
    await userServiceRequest.followSubreddits(username, subreddit);

    return res.status(200).json({
      status: "success",
      message: "Subreddit followed successfully",
    });
  } catch (error) {
    console.error("Error following subreddit:", error);
    return res.status(500).json({
      status: "failed",
      message: "An error occurred while following subreddit",
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