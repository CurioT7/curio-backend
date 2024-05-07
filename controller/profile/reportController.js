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
//TODO if approved discard report
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
        isIgnored: false,
        isViewed: false, 
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

/**
 * Takes action on a reported item by an admin.
 * @async
 * @function takeActionOnReport
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @returns {Promise<void>} A promise that resolves once the action is taken on the report.
 */
async function takeActionOnReport(req, res) {
  try {
    if (req.user) {
      const user = await User.findOne({ _id: req.user.userId });

      const { reportId, action } = req.body;

      // Find the report by ID
      const report = await UserReports.findById(reportId);
      if (!report) {
        return res.status(404).json({ message: "Report not found" });
      }

      // Perform action based on the request
      switch (action) {
        case "ignore":
          if (report.isIgnored === true) {
            return res.status(400).json({ message: "Report already ignored" });
          } else {
            report.isIgnored = true;
            await report.save();
            return res
              .status(200)
              .json({ message: "Item ignored successfully" });
          }
           
        case "ban":
          //TODO add ban to database and add more details
          const reportedUser = await User.findOne({
            username: report.reportedUsername,
          });
          if (report.linkedItemType !== "User") {
            return res.status(400).json({ message: "You can only ban a user" });
          } else if(reportedUser.username == user.username){
            return res.status(400).json({ message: "You can't ban yourself'" });
          }else if (reportedUser.isBanned === true) {
            return res.status(200).json({ message: "User is already banned" });
          } else {
            reportedUser.isBanned = true;
            report.isViewed = true;
            await reportedUser.save();
            return res
              .status(200)
              .json({ message: "User banned successfully" });
          }
        case "delete":
          if (
            !(
              report.linkedItemType === "Post" ||
              report.linkedItemType === "Comment"
            )
          ) {
            return res
              .status(400)
              .json({ message: "You can only delete a post or a comment" });
          } else {
            let reportedContent;
            if (report.linkedItemType === "Post") {
              reportedContent = await Post.findById(report.linkedItem);
              await Post.deleteOne({ _id: report.linkedItem });
              // Remove the post from the corresponding subreddit schema
              await Subreddit.findOneAndUpdate(
                { _id: report.linkedSubreddit },
                { $pull: { posts: report.linkedItem } },
                { new: true }
              );
            } else {
              reportedContent = await Comment.findById(report.linkedItem);
              await Comment.deleteOne({ _id: report.linkedItem });
            }
            if (!reportedContent) {
              return res.status(404).json({ message: "Item not found" });
            }
            report.isViewed = true;
            return res
              .status(200)
              .json({ message: "Item deleted successfully" });
          }
        default:
          return res.status(400).json({ message: "Invalid action" });
      }
    }
  } catch (error) {
    console.error("Error taking action on report:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
} 

/**
 * Retrieves admin reports that have not been ignored or viewed yet.
 * @async
 * @function getAdminReports
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @returns {Promise<void>} A promise that resolves with the admin reports.
 */
async function getAdminReports(req, res) {
  try {
    if (req.user) {
      const reports = await UserReports.find({
        isIgnored: false,
        isViewed: false,
      }).populate("linkedItem");
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
 * Retrieves admin reports history, including ignored and viewed reports.
 * @async
 * @function getAdminReportsHistory
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @returns {Promise<void>} A promise that resolves with the admin reports history.
 */
async function getAdminReportsHistory(req, res) {
  try {
    if (req.user) {
      const reports = await UserReports.find({
        isIgnored: true,
        isViewed: true,
      }).populate("linkedItem");
      return res.status(200).json({ success: true, reports });
    }
  } catch (error) {
    console.error("Error getting reports:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
}

module.exports = {
  reportUser,
  reportContent,
  getSubredditReportedContent,
  getAdminReports,
  takeActionOnReport,
  getAdminReportsHistory,
};
