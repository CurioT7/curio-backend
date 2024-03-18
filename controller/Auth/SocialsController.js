const express = require("express");
require("dotenv").config();
const User = require("../../models/userModel");
const generator = require("generate-password");
const jwt = require("jsonwebtoken");
const { generatePassword } = require("../../utils/passwords");
const { generateToken } = require("../../utils/tokens");

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

module.exports = { webSignup, googleCallbackHandler };
