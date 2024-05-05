const mongoose = require("mongoose");
const User = require("../../models/userModel");
const UserReports = require("../../models/reportModel");
const Post = require("../../models/postModel");
const Comment = require("../../models/commentModel");
const Subreddit = require("../../models/subredditModel");
const { verifyToken } = require("../../utils/tokens");


/**
 * Handles the reporting of a user.
 * @async
 * @function
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @param {string} req.body.reportedUsername - The username of the user being reported.
 * @param {string} req.body.reportType - The type of report (e.g., "username", "profile image").
 * @param {string} req.body.reportReason - The reason for the report.
 * @returns {Promise<void>} A promise representing the completion of the report process.
 * @throws {Error} If an error occurs while reporting the user.
 **/
async function reportUser(req, res) {
  try {
    if (req.user) {
      const user = await User.findOne({ _id: req.user.userId });
      const { reportedUsername, reportType, reportReason, reportDetails } =
        req.body;

      // Check if the reportedUsername exists in the User database
      const existingUser = await User.findOne({ username: reportedUsername });
      if (!existingUser) {
        return res.status(400).json({
          success: false,
          message: "Reported user does not exist",
        });
      }

      //check if the user is trying to report themselves
      if (user.username === reportedUsername) {
        return res.status(400).json({
          success: false,
          message: "You cannot report yourself",
        });
      }

      // Create a new report instance
      const newReport = new UserReports({
        reporterUsername: user.username,
        reportedUsername,
        linkedItem: user._id,
        linkedItemType: "User",
        reportType,
        reportReason,
        reportDetails,
      });

      await newReport.save();

      return res.status(201).json({
        success: true,
        message: "Report submitted successfully",
      });
    }
  } catch (error) {
    console.error("Error reporting user:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
}

/**
 * Handles reporting content.
 * @async
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @returns {Promise<void>} A Promise representing the completion of the reporting process.
 */
async function reportContent(req, res) {
  try {
    if (req.user) {
      const user = await User.findOne({ _id: req.user.userId });
      const { itemID, reportType, reportReason, reportDetails } = req.body;

      let item;
      let itemType;
      if (reportType === "post") {
        item = await Post.findOne({ _id: itemID });
        itemType = "Post";
      } else if (reportType === "comment") {
        item = await Comment.findOne({ _id: itemID });
        itemType = "Comment";
      }
      if (!item) {
        return res
          .status(404)
          .json({ success: false, message: "Item not found" });
      }

      //check if the user is trying to report his own content
      if (user.username === item.authorName) {
        return res.status(400).json({
          success: false,
          message: "You cannot report your own content",
        });
      }
      //TODO notify moderator

      // Create a new report instance
      const newReport = new UserReports({
        reporterUsername: user.username,
        reportedUsername: item.authorName,
        itemID: itemID,
        linkedSubreddit: item.linkedSubreddit,
        linkedItem: item._id,
        linkedItemType: itemType,
        reportType,
        reportReason,
        reportDetails,
      });

      await newReport.save();

      return res.status(201).json({
        success: true,
        message: "Report submitted successfully",
      });
    }
  } catch (error) {
    console.error("Error reporting content:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
}


async function getAdminReports(req, res) {
  try {
    if (req.user) {
      const reports = await UserReports.find().populate("linkedItem");
      return res.status(200).json({ success: true, reports });
    }
  } catch (error) {
    console.error("Error getting reports:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
}

/**
 * Retrieves reported content for a certain subreddit and returns the whole post/comment.
 * @async
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @param {function} next - The next function to be called in the middleware chain.
 * @returns {Promise<void>} A Promise representing the completion of the function.
 */
async function getSubredditReportedContent(req, res, next) {
  try {
    if (req.user) {
      const user = await User.findOne({ _id: req.user.userId });

      const subredditName = decodeURIComponent(req.params.subreddit);
      const subreddit = await Subreddit.findOne({ name: subredditName });
      if (!subreddit) {
        return res.status(404).json({ message: "Subreddit not found" });
      }
      // Check if the user is a moderator of the specified subreddit
      const isModerator = user.moderators.some(
        (moderator) => moderator.subreddit === subredditName
      );
      if (!isModerator) {
        return res
          .status(403)
          .json({ message: "Forbidden, you must be a moderator!" });
      }
      const reportedItems = await UserReports.find({
        reportType: { $in: ["post", "comment"] },
        linkedSubreddit: subreddit._id,
      }).populate("linkedItem");

      if (reportedItems.length === 0) {
        return res.status(200).json({ success: true, content: [] });
      }

      return res.status(200).json({
        success: true,
        reports: reportedItems,
      });
    }
  } catch (error) {
    console.error("Error retrieving reported content:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
}

module.exports = {
  reportUser,
  reportContent,
  getSubredditReportedContent,
  getAdminReports,
};
