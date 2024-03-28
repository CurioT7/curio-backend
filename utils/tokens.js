/**
 * Utility functions for working with JWT tokens.
 * @module utils/tokens
 * @requires jsonwebtoken
 * @requires dotenv
 * @requires ../models/userModel
 */

const jwt = require("jsonwebtoken");
require("dotenv").config();
const user = require("../models/userModel");
const axios = require("axios");

/**
 * Generate a JWT token for the user.
 * @param {string} userId - The user ID.
 * @returns {Promise<string>} - A promise that resolves with the JWT token.
 */

async function generateToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "24h" });
}

/**
 * Verify a JWT token.
 * @param {string} token - The JWT token to verify.
 * @returns {Promise<Object>} - A promise that resolves with the token payload.
 */

async function verifyToken(token) {
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    return payload;
  } catch (err) {
    return null;
  }
}

async function refreshToken(token) {
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    return jwt.sign({ userId: payload.userId }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });
  } catch (err) {
    return null;
  }
}

//Verify token sent from firebase
async function verifyFirebaseToken(token) {
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    return decodedToken;
  } catch (err) {
    throw new Error(err);
  }
}

async function verifyGoogleToken(token) {
  try {
    const response = await axios.get(
      `https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${token}`
    );
    return response;
  } catch (err) {
    throw new Error(err);
  }
}

module.exports = {
  generateToken,
  verifyToken,
  verifyFirebaseToken,
  verifyGoogleToken,
  refreshToken,
};
