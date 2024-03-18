const User = require("../../models/userModel");
const UserReports = require("../../models/reportModel");
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
    const token = req.headers.authorization.split(" ")[1];
    const decoded = await verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const user = await User.findOne({ _id: decoded.userId });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const { reportedUsername, reportType, reportReason } = req.body;

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
      reportType,
      reportReason,
    });

    await newReport.save();

    return res.status(201).json({
      success: true,
      message: "Report submitted successfully",
    });
  } catch (error) {
    console.error("Error reporting user:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
}

module.exports = {
  reportUser: reportUser,
};
