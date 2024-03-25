const express = require("express");
require("dotenv").config();
const User = require("../../models/userModel");
const generator = require("generate-password");
const jwt = require("jsonwebtoken");
const { generatePassword } = require("../../utils/passwords");
const { generateToken, verifyFirebaseToken } = require("../../utils/tokens");
const axios = require("axios");

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
      firstName: userInfo.name.givenName,
      //username is given name and random generated number
      username: `${userInfo.name.givenName}${Math.floor(Math.random() * 1000)}`,
      email: userInfo.emails[0].value,
      password: password,
      socialMediaType: socialMediaType,
      isVerified: true,
    };
    if (socialMediaType === "google") {
      newUser.googleId = userInfo.id;
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

const verifyGoogleToken = async (req, res) => {
  const { token } = req.body;
  try {
    const response = await axios.get(
      `https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${token}`
    );

    if (response.status === 200) {
      const user = await User.findOne({ email: response.data.email });
      if (!user) {
        await webSignup(response.data, "google");
      }
      const accessToken = await generateToken(user._id);
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

module.exports = {
  webSignup,
  googleCallbackHandler,
  verifyGoogleToken,
  googleConnectCallbackHandler,
};
