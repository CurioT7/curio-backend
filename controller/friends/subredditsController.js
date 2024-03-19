const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const User = require("../../models/userModel");
const Community = require("../../models/subredditModel");
require("dotenv").config();
const { addUserToSubbreddit } = require("./friendController");
const { verifyToken } = require("../../utils/tokens");

/**
 * Check whether subreddit is available or not
 * @param {string} subreddit
 * @returns {object} {state and subreddit}
 * @function
 */
async function availableSubreddit(subreddit) {
  try {
    const subReddit = await Community.findOne({ name: subreddit });
    if (subReddit) {
      return {
        success: false,
        subreddit: subReddit,
      };
    } else {
      return {
        success: true,
        subreddit: null,
      };
    }
  } catch (error) {
    console.error("Error checking subreddit availability:", error);
    return {
      success: false,
      subreddit: null,
      error: "An error occurred while checking subreddit availability",
    };
  }
}
/**
 * Create subreddit
 * @param {string} data contain
 * @param {string} user user information
 * @return {Object} state
 * @function
 */

async function createSubreddit(data, user) {
  const subredditName = data.name;
  const username = user.username;
  const communityName = `${subredditName}_${username}`;
  // If the subreddit name is not available (state is false), return an error response
  const subredditAvailable = await availableSubreddit(subredditName);
  //if subreddit is not available
  if (!subredditAvailable.success) {
    return {
      success: false,
      error: "Subreddit name is not available",
    };
  }
  const moderator = {
    subreddit: subredditName,
    username: username,
    role: "creator",
  };
  const member = {
    subreddit: subredditName,
    username: username,
  };
  const newSubreddit = {
    name: subredditName,
    isOver18: data.over18,
    description: data.description,
    privacyMode: data.privacyMode,
    moderators: [moderator],
    members: [member],
  };

  try {
    await Community.create(newSubreddit);

    await User.findOneAndUpdate(
      { username: username },
      {
        $push: {
          subreddits: {
            subreddit: subredditName,
            role: "creator",
          },
          members: { subreddit: subredditName },
          moderators: { subreddit: subredditName },
        },
      }
    );
    // Return success response
    return {
      success: true,
      response: "Subreddit created successfully",
      communityName: communityName,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: "Failed to create subreddit",
    };
  }
}
/**
 * Create subreddit
 * @param {Object} req Express request object
 * @param {Object} res Express response object
 * @returns {Object} Response object
 */
async function newSubreddit(req, res) {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = await verifyToken(token);
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }
    const user = await User.findOne({ _id: decoded.userId });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const result = await createSubreddit(req.body, user);
    console.log("adad");
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error,
      });
    }
    await addUserToSubbreddit(user, result.communityName);

    return res.status(200).json({
      success: true,
      message: result.response,
      communityName: result.communityName,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

module.exports = {
  newSubreddit,
  availableSubreddit,
  createSubreddit,
};
