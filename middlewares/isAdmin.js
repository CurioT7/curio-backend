const User = require("../models/userModel");

async function isAdmin(req, res, next) {
  if (req.user) {
    try {
      const user = await User.findOne({ _id: req.user.userId });
      if (user.access === "admin") {
        next();
      } else {
        return res
          .status(403)
          .json({ message: "Forbidden, you must be an admin!" });
      }
    } catch (error) {
      console.error("Error checking user access:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
}

module.exports = { isAdmin };
