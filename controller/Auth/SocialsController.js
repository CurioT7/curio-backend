const express = require("express");
require("dotenv").config();
const User = require("../../models/userModel");
const generator = require("generate-password");
const jwt = require("jsonwebtoken");
const { generatePassword } = require("../../utils/passwords");
const { generateRandomUsername } = require("../../utils/username");
const { comparePassword } = require("../../utils/passwords");
const {
  generateToken,
  verifyFirebaseToken,
  verifyToken,
  verifyGoogleToken,
} = require("../../utils/tokens");
const axios = require("axios");
const { fi } = require("faker/lib/locales");

/**
 * Sign up a user using web authentication with social media.
 *
 * @param {Object} userInfo - The user information object.
 * @param {string} socialMediaType - The social media type used for authentication.
 * @returns {Promise<void>} - A promise that resolves when the user is created successfully.
 * @throws {Error} - If there is an error creating the user.
 */

async function webSignup(userInfo, socialMediaType) {
  try {
    var password = generatePassword();
    var newUser = {
      //generate a random username
      username: await generateRandomUsername(),
      email: userInfo.email,
      password: password,
      socialMediaType: socialMediaType,
      isVerified: true,
      createdPassword: false,
    };
    if (socialMediaType === "google") {
      newUser.googleId = userInfo.user_id;
    }
    await User.create(newUser);
  } catch (err) {
    throw new Error(err);
  }
}

/**
 * Generate a JWT token for the user.
 * @param {string} userId - The user ID.
 * @returns {Promise<string>} - A promise that resolves with the JWT token.
 */

// Define the callback handler function
const googleCallbackHandler = async (req, res) => {
  // Generate JWT token
  const accessToken = await generateToken(req.user._id);

  // Send the access token and user information back to the client
  res.status(200).json({
    success: true,
    message: "User logged in Successfully",
    accessToken,
  });
};

const googleConnectCallbackHandler = async (req, res) => {
  if (req.user.googleId) {
    res.status(200).json({
      success: true,
      message: "Google account connected successfully",
    });
  }
};

/**
 * Authenticate a user using Google OAuth.
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 * @returns {Object} - The response object containing the access token.
 * @throws {Error} - If there is an error authenticating the user.
 */

const googleAuth = async (req, res) => {
  const { token } = req.body;
  try {
    const response = await verifyGoogleToken(token);
    if (response.status === 200) {
      let user = await User.findOne({ googleId: response.data.user_id });
      //if user doesn't exist or googleId is not set, create a new user
      if (!user) {
        await webSignup(response.data, "google");
      }
      user = await User.findOne({ googleId: response.data.user_id });
      const accessToken = await generateToken(user._id);
      if (user.gender === null) {
        return res
          .status(200)
          .json({ success: true, accessToken, firstTime: true });
      }
      res.status(200).json({ success: true, accessToken });
    } else {
      res.status(400).json({ success: false, message: "Token is invalid" });
    }
  } catch (err) {
    console.error("Error verifying Google token:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to verify Google token" });
  }
};

/**
 * Connect a user's Google account.
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 * @returns {Object} - The response object containing the success message.
 * @throws {Error} - If there is an error connecting the account.
 */

async function connectWithGoogle(req, res) {
  const token = req.headers.authorization.split(" ")[1];
  const decoded = await verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  const googleToken = req.body.token;
  const password = req.body.password;

  try {
    const response = await verifyGoogleToken(googleToken);
    if (response.status === 200) {
      let user = await User.findOne({ googleId: response.data.user_id });

      if (user) {
        return res.status(400).json({
          success: false,
          message: "Google account already connected",
        });
      }

      user = await User.findOne({ _id: decoded.userId });

      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      const isMatch = await comparePassword(password, user.password);

      if (!isMatch) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid password" });
      }

      user.googleId = response.data.user_id;
      await user.save();

      return res.status(200).json({
        success: true,
        message: "Google account connected successfully",
      });
    }
  } catch (err) {
    console.error("Error connecting account", err);
    return res
      .status(500)
      .json({ success: false, message: "Error connecting account" });
  }
}

async function disconnectGoogle(req, res) {
  const token = req.headers.authorization.split(" ")[1];
  const decoded = await verifyToken(token);
  try {
    if (!decoded) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const { password } = req.body;
    const user = await User.findOne({ _id: decoded.userId });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid password" });
    }
    if (user.googleId === null) {
      return res.status(400).json({
        success: false,
        message: "Google account is not connected",
      });
    }
    user.googleId = null;
    await user.save();
    res.status(200).json({
      success: true,
      message: "Google account disconnected successfully",
    });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Error disconnecting account" });
  }
}

module.exports = {
  webSignup,
  googleCallbackHandler,
  googleAuth,
  googleConnectCallbackHandler,
  connectWithGoogle,
  disconnectGoogle,
};
