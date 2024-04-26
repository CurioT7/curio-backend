const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const User = require("../../models/userModel");
const Community = require("../../models/subredditModel");
require("dotenv").config();
const { addUserToSubbreddit } = require("./friendController");
const { verifyToken } = require("../../utils/tokens");
const Notification = require("../../models/notificationModel");
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
    // Notify the user about subreddit creation
    const notification = new Notification({
      title: "Subreddit Created",
      message: `You have successfully created the subreddit "${subredditName}".`,
      recipient: username,
    });
    await notification.save();

    // Return success response
    return {
      success: true,
      response: "Subreddit created successfully",
      communityName: subredditName,
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
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error,
      });
    }

    const addUserResult = await addUserToSubbreddit(user, result.communityName);
    if (!addUserResult.success) {
      return res.status(400).json({
        success: false,
        message: addUserResult.message,
      });
    }

    return res.status(201).json({
      success: true,
      message: addUserResult.message,
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

/**
 * Get information about a subreddit by name.
 * @async
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @returns {Promise<void>} A promise that resolves once the response is sent.
 */
async function getSubredditInfo(req, res) {
  const subredditName = decodeURIComponent(req.params.subreddit);

  try {
    // Query the database for the subreddit by name
    const subreddit = await Community.findOne({ name: subredditName });

    if (!subreddit) {
      return res
        .status(404)
        .json({ success: false, message: "Subreddit not found" });
    }

    return res.status(200).json({
      success: true,
      subreddit: subreddit.toObject(), // Convert Mongoose document to plain JavaScript object
    });
  } catch (error) {
    console.error("Error fetching subreddit:", error);
    return res
      .status(500)
      .json({ success: false, error: "Failed to fetch subreddit" });
  }
}

/**
 * Retrieves the top communities sorted by the number of members.
 * @param {import('express').Request} req - The request object.
 * @param {import('express').Response} res - The response object.
 * @returns {Promise<void>} - Promise that resolves once the operation is complete.
 */
async function getTopCommunities(req, res) {
  const page = parseInt(req.query.page) || 1; // Default to page 1 if not provided
  const limit = 10; // Allow 10 items per page 
  const sortBy = "members"; // Default sorting by members 

  try {
    const skip = (page - 1) * limit;
    const totalCommunitiesCount = await Community.countDocuments();
    const communities = await Community.aggregate([
      {
        $project: {
          name: 1,
          category:1,
          members: { $size: "$members" }, // Count the number of members for each community
        },
      },
      { $sort: { [sortBy]: -1 } }, 
      { $skip: skip },
      { $limit: limit },
    ]);

    res.status(200).json({ success: true, totalCommunitiesCount, communities });
  } catch (error) {
    console.error("Error fetching communities:", error);
    res
      .status(500)
      .json({ success: false,message: "Internal server error", error:error.message});
  }
}

module.exports = {
  newSubreddit,
  availableSubreddit,
  createSubreddit,
  getSubredditInfo,
  getTopCommunities,
};
