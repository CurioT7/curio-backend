const User = require('../../models/userModel');
const Notification = require('../../models/notificationModel');
const { verifyToken } = require("../../utils/tokens");
const Post = require('../../models/postModel'); 
require("dotenv").config();
const brypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Subreddit = require('../../models/subredditModel');

/**
 * Retrieves unsent notifications for the authenticated user and updates the isSent flag.
 * @function getUnsentNotificationsForUser
 * @param {express.Request} req - The request object.
 * @param {express.Response} res - The response object.
 * @returns {void}
 */
async function getUnsentNotificationsForUser(req, res) {
  try {
    if (req.user) {
      const user = await User.findOne({ _id: req.user.userId });

      // Use aggregation to find notifications by recipient ID 
      const notifications = await Notification.aggregate([
        {
          $match: {
            recipient: user.username,
            isSent: false,
          },
        },
      ]);

      await Notification.updateMany(
        {
          _id: {
            $in: notifications.map((notification) => notification._id),
          },
        },
        { $set: { isSent: true } }
      );
      if (notifications.length == 0) {
        return res
          .status(200)
          .json({ success: true, message: "There are no unsent notifications" });
      } else {
        return res
          .status(200)
          .json({ success: true, notifications: notifications });
      }
    }
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

/**
 * Retrieves all notifications for the authenticated user.
 * @function getAllNotificationsForUser
 * @param {express.Request} req - The request object.
 * @param {express.Response} res - The response object.
 * @returns {void}
 */
async function getAllNotificationsForUser(req, res) {
  try {
    if (req.user) {
      const user = await User.findOne({ _id: req.user.userId });

      //find notifications by recipient name
      const notifications = await Notification.aggregate([
        {
          $match: {
            recipient: user.username,
          },
        },
      ]);

      // If the user hasn't joined any communities, suggest a random Subreddit
      if (user.subreddits.length === 0) {
        const randomSubreddit = await Subreddit.aggregate([
          { $sample: { size: 1 } },
        ]);
        const notification = new Notification({
          title: "Join " + randomSubreddit[0].name,
          message:
            "You haven't joined any communities yet. Consider joining " +
            randomSubreddit[0].name,
          recipient: user.username,
        });
        await notification.save();
      }

      return res
        .status(200)
        .json({ success: true, notifications: notifications });
    }
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

/**
 * Disables notifications for a user based on the specified subreddit, post, or comment.
 * @async
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {object} - Express response object 
 */
async function disableNotificationsForUser  (req, res) {

  const { subredditName, postId, commentId } = req.body;

  try {
    if (req.user) {
      const user = await User.findOne({ _id: req.user.userId });

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
        const subredditExists = await checkSubredditExists(subredditName);
        if (!subredditExists) {
          return res.status(400).json({ success: false, message: "Subreddit does not exist" });
        }
      }

      if (postId) {
        const postExists = await checkPostExists(postId);
        if (!postExists) {
          return res.status(400).json({ success: false, message: "Post does not exist" });
        }
      }

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

      await user.save();

      return res.status(200).json({ success: true, message: "Notifications disabled successfully" });
    }
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Checks if a subreddit with the given name exists in the database.
 * @function checkSubredditExists
 * @param {string} subredditName - The name of the subreddit to check.
 * @returns {Promise<boolean>} A Promise that resolves to true if the subreddit exists, false otherwise.
 */
async function checkSubredditExists  (subredditName)  {
  try {
    const subreddit = await Subreddit.findOne({ name: subredditName });
    return subreddit !== null;
  } catch (error) {
    console.error("Error checking subreddit:", error);
    return false;
  }
};

/**
 * Checks if a post with the given ID exists in the database.
 * @function checkPostExists
 * @param {string} postId - The ID of the post to check.
 * @returns {Promise<boolean>} A Promise that resolves to true if the post exists, false otherwise.
 */
async function checkPostExists  (postId)  {
  try {
    const post = await Post.findById(postId);
    return post !== null;
  } catch (error) {
    console.error("Error checking post:", error);
    return false;
  }
};

/**
 * Checks if a comment with the given ID exists in the database.
 * @function checkCommentExists
 * @param {string} commentId - The ID of the comment to check.
 * @returns {Promise<boolean>} A Promise that resolves to true if the comment exists, false otherwise.
 */
async function checkCommentExists  (commentId)  {
  try {
    const comment = await Comment.findById(commentId);
    return comment !== null;
  } catch (error) {
    console.error("Error checking comment:", error);
    return false;
  }
};

/**
 * Enables notifications for the authenticated user based on the provided parameters.
 * @function enableNotificationsForUser
 * @param {express.Request} req - The request object.
 * @param {express.Response} res - The response object.
 * @returns {void}
 */
async function enableNotificationsForUser(req, res) {

  const { subredditName, postId, commentId } = req.body;

  try {
    if (req.user) {
      const user = await User.findOne({ _id: req.user.userId });

      // Check if subredditName is provided and exists in the database
      if (subredditName) {
        const subredditExists = await checkSubredditExists(subredditName);
        if (!subredditExists) {
          return res
            .status(404)
            .json({ success: false, message: "Subreddit does not exist" });
        }
      }

      // Check if postId is provided and exists in the database
      if (postId) {
        const postExists = await checkPostExists(postId);
        if (!postExists) {
          return res
            .status(404)
            .json({ success: false, message: "Post does not exist" });
        }
      }

      // Check if commentId is provided and exists in the database
      if (commentId) {
        const commentExists = await checkCommentExists(commentId);
        if (!commentExists) {
          return res
            .status(404)
            .json({ success: false, message: "Comment does not exist" });
        }
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
        return res.status(400).json({
          success: false,
          message: "Notification for this is not disabled",
        });
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

      await user.save();

      return res
        .status(200)
        .json({ success: true, message: "Notifications enabled successfully" });
    }
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

/**
 * Hide notifications for a user.
 * @async
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} A promise that resolves once the notifications are hidden.
 */
const hideNotifications = async (req, res) => {
  try {
    if (req.user) {
      const user = await User.findOne({ _id: req.user.userId });

      const notificationID = req.body.notificationID;

      // Find the notification by its ID and recipient
      const notification = await Notification.findOne({
        _id: notificationID,
        recipient: user.username,
      });

      if (!notification) {
        return res.status(404).json({
          success: false,
          message: "Notification not found",
        });
      }

      // Check if the notification is already hidden
      if (user.hiddenNotifications.includes(notificationID)) {
        return res.status(200).json({
          success: true,
          message: "Notification is already hidden",
        });
      }

      // Update user's hiddenNotifications array
      user.hiddenNotifications.push(notificationID);
      await user.save();

      return res.status(200).json({
        success: true,
        message: "Notification hidden successfully",
      });
    }
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};


/**
 * unhide notifications for a user.
 * @async
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} A promise that resolves once the notifications are hidden.
 */
const unhideNotifications = async (req, res) => {

  try {
    if (req.user) {
      const user = await User.findOne({ _id: req.user.userId });
     
      const notificationID = req.body.notificationID;

      // Find the notification by its ID and recipient
      const notification = await Notification.findOne({
        _id: notificationID,
        recipient: user.username,
      });

      if (!notification) {
        return res.status(404).json({
          success: false,
          message: "Notification not found",
        });
      }

      // Check if the notification is already unhidden
      if (!user.hiddenNotifications.includes(notificationID)) {
        return res.status(200).json({
          success: true,
          message: "Notification is already unhidden",
        });
      }

      // Update user's hiddenNotifications array
      user.hiddenNotifications.pull(notificationID);
      await user.save();

      return res.status(200).json({
        success: true,
        message: "Notification unhidden successfully",
      });
    }
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};


/**
 * Get unread notifications and their count for a user.
 * @async
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} A promise that resolves with unread notifications and their count.
 */
const getUnreadNotifications = async (req, res) => {
   try {
     if (req.user) {
       const user = await User.findOne({ _id: req.user.userId });

       if (!user) {
         return res.status(404).json({
           status: "failed",
           message: "User not found",
         });
       }
       // Find unread notifications for the user
       const unreadNotifications = await Notification.aggregate([
         {
           $match: {
             recipient: user.username,
             isRead: false,
           },
         },
       ]);

       // Get the count of unread notifications
       const unreadCount = unreadNotifications.length;
         return res
           .status(200)
           .json({ success: true, unreadCount, unreadNotifications });
     }
   } catch (error) {
     console.error("Error:", error);
     return res.status(500).json({ message: "Internal server error" });
   }
};

/**
 * Get read notifications and their count for a user.
 * @async
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} A promise that resolves with unread notifications and their count.
 */
const getReadNotifications = async (req, res) => {
   try {
     if (req.user) {
       const user = await User.findOne({ _id: req.user.userId });
   
       // Find read notifications for the user
       const readNotifications = await Notification.aggregate([
         {
           $match: {
             recipient: user.username,
             isRead: true,
           },
         },
       ]);

       // Get the count of read notifications
       const readCount = readNotifications.length;
         return res
           .status(200)
           .json({ success: true, readCount, readNotifications });
     }
   } catch (error) {
     console.error("Error:", error);
     return res.status(500).json({ message: "Internal server error" });
   }
};

/**
 * Reads a notification for the authenticated user.
 * @async
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Object} The response containing the status of the operation.
 */
const readNotifications = async (req, res) => {

  try {
    if (req.user) {
      const user = await User.findOne({ _id: req.user.userId });

      const notificationID = req.body.notificationID;

      // Find the notification by its _id
      const notification = await Notification.findById(notificationID);

      // Check if the notification exists
      if (!notification) {
        return res.status(404).json({
          success: false,
          message: "Notification not found",
        });
      }

      // Check if the notification belongs to the user and is unread
      if (notification.recipient !== user.username) {
        return res.status(400).json({
          success: false,
          message:
            "Notification does not belong to the user",
        });
      }
      if (notification.isRead) {
        return res.status(400).json({
          success: false,
          message: "Notification is already read",
        });
      }

      notification.isRead = true;
      await notification.save();

      return res.status(200).json({
        success: true,
        message: "Notification read successfully",
      });
    }
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};


module.exports = {
  getAllNotificationsForUser,
  disableNotificationsForUser,
  enableNotificationsForUser,
  hideNotifications,
  unhideNotifications,
  getUnreadNotifications,
  getReadNotifications,
  getUnsentNotificationsForUser,
  readNotifications,
};
