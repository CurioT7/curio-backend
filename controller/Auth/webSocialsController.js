const express = require("express");
require("dotenv").config();
const User = require("../../models/user");
const generator = require("generate-password");
const jwt = require("jsonwebtoken");
const { generatePassword } = require("../../utils/passwords");

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
    } else if (socialMediaType === "facebook") {
      newUser.facebookId = userInfo.id;
    }
    await User.create(newUser);
  } catch (err) {
    throw new Error(err);
  }
}

// Define the callback handler function
const googleCallbackHandler = (req, res) => {
  // Generate JWT token
  const tokenPayload = {
    userId: req.user._id,
  };
  const accessToken = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
    expiresIn: "24h",
  });

  // Send the access token and user information back to the client
  res.status(200).json({
    success: true,
    message: "User logged in Successfully",
    accessToken,
  });
};

module.exports = { webSignup, googleCallbackHandler };
