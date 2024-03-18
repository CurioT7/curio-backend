const User = require("../../models/userModel");
const UserReports = require("../../models/reportModel");

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
    
    const { reportedUsername, reportType, reportReason } = req.body;

    // Check if the reportedUsername exists in the User database
    const existingUser = await User.findOne({ username: reportedUsername });
    if (!existingUser) {
      return res.status(400).json({
        success: false,
        message: "Reported user does not exist",
      });
    }

    // Create a new report instance
    const newReport = new UserReports({
      reportedUsername,
      reportType,
      reportReason,
    });

    await newReport.save();

    return res.status(201).json({
      succes: true,
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
