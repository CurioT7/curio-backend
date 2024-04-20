const User = require('../../models/userModel');
const Notification = require('../../models/notificationModel');
const { verifyToken } = require("../../utils/tokens");
const Post = require('../../models/postModel'); 
require("dotenv").config();
const brypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Subreddit = require('../../models/subredditModel');


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
// Function to disable notifications for a user based on subreddit, post, or comment
async function disableNotificationsForUser  (req, res) {
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
        disabledComments: []
      };
    }

    // Check if subredditName is provided and exists in the database
    if (subredditName) {
      // Check if the subreddit exists in the database
      const subredditExists = await checkSubredditExists(subredditName);
      if (!subredditExists) {
        return res.status(400).json({ success: false, message: "Subreddit does not exist" });
      }
    }

    // Check if postId is provided and exists in the database
    if (postId) {
      const postExists = await checkPostExists(postId);
      if (!postExists) {
        return res.status(400).json({ success: false, message: "Post does not exist" });
      }
    }

    // Check if commentId is provided and exists in the database
    if (commentId) {
      const commentExists = await checkCommentExists(commentId);
      if (!commentExists) {
        return res.status(400).json({ success: false, message: "Comment does not exist" });
      }
    }

    // Check if the subreddit, post, or comment is already disabled for the user
    if (subredditName && user.notificationSettings.disabledSubreddits.includes(subredditName)) {
      return res.status(400).json({ success: false, message: "Subreddit is already disabled for this user" });
    }
    if (postId && user.notificationSettings.disabledPosts.includes(postId)) {
      return res.status(400).json({ success: false, message: "Post is already disabled for this user" });
    }
    if (commentId && user.notificationSettings.disabledComments.includes(commentId)) {
      return res.status(400).json({ success: false, message: "Comment is already disabled for this user" });
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

    return res.status(200).json({ success: true, message: "Notifications disabled successfully" });

  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Function to check if subreddit exists in the database
async function checkSubredditExists  (subredditName)  {
  try {
    // Assuming you have a Subreddit model
    const subreddit = await Subreddit.findOne({ name: subredditName });
    return subreddit !== null;
  } catch (error) {
    console.error("Error checking subreddit:", error);
    return false;
  }
};

// Function to check if post exists in the database
async function checkPostExists  (postId)  {
  try {
    // Assuming you have a Post model
    const post = await Post.findById(postId);
    return post !== null;
  } catch (error) {
    console.error("Error checking post:", error);
    return false;
  }
};

// Function to check if comment exists in the database
async function checkCommentExists  (commentId)  {
  try {
    // Assuming you have a Comment model
    const comment = await Comment.findById(commentId);
    return comment !== null;
  } catch (error) {
    console.error("Error checking comment:", error);
    return false;
  }
};
async function enableNotificationsForUser(req, res) {
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
    // Check if subredditName, postId, or commentId is provided and exists in the disabled arrays
    if (
      (subredditName &&
        !user.notificationSettings.disabledSubreddits.includes(
          subredditName
        )) ||
      (postId && !user.notificationSettings.disabledPosts.includes(postId)) ||
      (commentId &&
        !user.notificationSettings.disabledComments.includes(commentId))
    ) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Notification for this is not disabled",
        });
    }

    // Check if subredditName is provided and exists in the database
    if (subredditName) {
      const subredditExists = await checkSubredditExists(subredditName);
      if (!subredditExists) {
        return res
          .status(400)
          .json({ success: false, message: "Subreddit does not exist" });
      }
    }

    // Check if postId is provided and exists in the database
    if (postId) {
      const postExists = await checkPostExists(postId);
      if (!postExists) {
        return res
          .status(400)
          .json({ success: false, message: "Post does not exist" });
      }
    }

    // Check if commentId is provided and exists in the database
    if (commentId) {
      const commentExists = await checkCommentExists(commentId);
      if (!commentExists) {
        return res
          .status(400)
          .json({ success: false, message: "Comment does not exist" });
      }
    }

    // Enable notifications for the user based on the parameters
    if (subredditName) {
      const index =
        user.notificationSettings.disabledSubreddits.indexOf(subredditName);
      if (index !== -1) {
        user.notificationSettings.disabledSubreddits.splice(index, 1);
      }
    }
    if (postId) {
      const index = user.notificationSettings.disabledPosts.indexOf(postId);
      if (index !== -1) {
        user.notificationSettings.disabledPosts.splice(index, 1);
      }
    }
    if (commentId) {
      const index =
        user.notificationSettings.disabledComments.indexOf(commentId);
      if (index !== -1) {
        user.notificationSettings.disabledComments.splice(index, 1);
      }
    }

    // Save the updated user in the database
    await user.save();

    return res
      .status(200)
      .json({ success: true, message: "Notifications enabled successfully" });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = {
  getAllNotificationsForUser,
  disableNotificationsForUser,
  enableNotificationsForUser,
};
