const User = require("../../models/userModel");
const { validationResult } = require("express-validator");
const { comparePassword } = require("../../utils/passwords");
const { generateToken } = require("../../utils/tokens");

/**
 * Login user
 * @async
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 * @returns {Object} - The response object containing the access token.
 * @throws {Error} - If there is an error logging in the user.
 */

async function appLogin(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { usernameOrEmail, password, fcmToken } = req.body; 
  // Check if user exists
  const user = await User.findOne({
    $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
  });
  if (!user) {
    return res.status(404).json({
      success: false,
      message: "Invalid credentials, check username or password",
    });
  }
  // Compare password
  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: "Invalid credentials, check username or password",
    });
  }
  // Generate access token
  const accessToken = await generateToken(user._id);
  // Save FCM token to user document
  user.fcmToken = fcmToken;
  await user.save();
  return res.status(200).json({
    success: true,
    message: "Login successful",
    accessToken,
    fcmToken,
  });
}


module.exports = { appLogin };
