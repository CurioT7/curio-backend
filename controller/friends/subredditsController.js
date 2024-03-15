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
 * Create subreddit
 * @param {Object} req Express request object
 * @param {Object} res Express response object
 * @returns {Object} Response object
 */
async function createSub(req, res) {
  try {
    const username = req.body.username;
    const user = await User.findOne({ username });

    // Check if user exists
    if (!user) {
      return res.status(404).json({
        status: "failed",
        message: "User not found",
      });
    }

    // Proceed with subreddit creation
    const result = await communityServiceRequest.createSubreddit(req.body, user); // Pass the entire request body
    if (!result.status) {
      return res.status(200).json({
        status: result.error,
      });
    }

    // Add user to the subreddit
    const updateUser = await userServiceRequest.addUserToSubbreddit(user, result.response.name); // Pass the subreddit name from the response
    if (!updateUser.status) {
      return res.status(500).json({
        status: "failed",
        message: "Failed to add user to the subreddit",
      });
    }

    return res.status(200).json({
      status: result.response,
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
   createSub,
};
