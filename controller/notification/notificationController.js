const User = require('../../models/userModel');
const Notification = require('../../models/notificationModel');
const { verifyToken } = require("../../utils/tokens");
const Post = require('../../models/postModel'); 
require("dotenv").config();
const brypt = require("bcrypt");
const jwt = require("jsonwebtoken");


// Function to get all notifications for a user
async function getAllNotificationsForUser (req, res) {
  // Extract the token from the request headers
  const token = req.headers.authorization.split(" ")[1];
  const decoded = await verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ message: "Unauthorized" });
  }
    try {
        // Find the user in the database
      const user = await User.findOne({ _id: decoded.userId });

      if (!user) {
        return res.status(404).json({
          status: "failed",
          message: "User not found",
        });
      }
    // Retrieve all notifications for the user from the database
    const notifications = await Notification.find({ recipient: user._id });
      return res.status(200).json({ success: true, notification: notifications });

  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
/**
 * Disables notifications for a user based on the specified subreddit, post, or comment.
 * @async
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {object} - Express response object 
 */
async function disableNotificationsForUser(req, res) {
  // Extract the token from the request headers
  const token = req.headers.authorization.split(" ")[1];
  const decoded = await verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Check the request body for parameters specifying the subreddit, post, or comment
  const { subredditName, postId, commentId } = req.body;

  try {
    // Find the user in the database
    const user = await User.findOne({ _id: decoded.userId });

    if (!user) {
      return res.status(404).json({
        status: "failed",
        message: "User not found",
      });
    }
    // Ensure that notificationSettings object exists and initialize it if not
    if (!user.notificationSettings) {
      user.notificationSettings = {
        disabledSubreddits: [],
        disabledPosts: [],
        disabledComments: [],
      };
    }

    // Update the user's notification settings based on the parameters
    if (subredditName) {
      user.notificationSettings.disabledSubreddits.push(subredditName);
    }
    if (postId) {
      user.notificationSettings.disabledPosts.push(postId);
    }
    if (commentId) {
      user.notificationSettings.disabledComments.push(commentId);
    }

    // Save the updated user in the database
    await user.save();

    return res
      .status(200)
      .json({ success: true, message: "Notifications disabled successfully" });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
    getAllNotificationsForUser,
    disableNotificationsForUser
};
