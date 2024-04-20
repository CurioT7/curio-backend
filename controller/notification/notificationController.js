const User = require('../../models/userModel');
const Notification = require('../../models/notificationModel');
const { verifyToken } = require("../../utils/tokens");
const Post = require('../../models/postModel'); 
require("dotenv").config();
const brypt = require("bcrypt");
const jwt = require("jsonwebtoken");


// Function to get all notifications for a user
const getAllNotificationsForUser = async (req, res) => {
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

module.exports = {
  getAllNotificationsForUser,
};
