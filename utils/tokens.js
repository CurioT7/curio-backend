/**
 * Utility functions for working with JWT tokens.
 * @module utils/tokens
 * @requires jsonwebtoken
 * @requires dotenv
 * @requires ../models/userModel
 */

const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../models/userModel");
const axios = require("axios");
const { userExist } = require("../controller/Auth/userController");

/**
 * Generate a JWT token for the user.
 * @param {string} userId - The user ID.
 * @returns {Promise<string>} - A promise that resolves with the JWT token.
 */

async function generateToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "24h" });
}

/**
 * Generate a JWT token for the user with a specific expiration time.
 * @param {string} userId - The user ID.
 * @param {string} time - The expiration time for the token.
 * @returns {Promise<string>} - A promise that resolves with the JWT token.
 */

async function generateTimedToken(userId, time) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: time });
}

/**
 * Generate a test JWT token for the user.
 * @param {string} userId - The user ID.
 * @returns {Promise<string>} - A promise that resolves with the JWT token.
 */
const generateTestToken = async (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "90d",
  });
};

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
/**
 * Refresh a JWT token.
 * @param {string} token - The JWT token to refresh.
 * @returns {Promise<string>} - A promise that resolves with the new JWT token.
 */

async function refreshToken(token) {
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    return jwt.sign({ userId: payload.userId }, process.env.JWT_SECRET, {
      expiresIn: "90days",
    });
  } catch (err) {
    return null;
  }
}

/**
 * Verify a Firebase token.
 * @param {string} token - The Firebase token to verify.
 * @returns {Promise<Object>} - A promise that resolves with the token payload.
 * @throws {Error} - If there is an error verifying the token.
 */

async function verifyFirebaseToken(token) {
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    return decodedToken;
  } catch (err) {
    throw new Error(err);
  }
}

/**
 * Verify a Google token.
 * @param {string} token - The Google token to verify.
 * @returns {Promise<Object>} - A promise that resolves with the token payload.
 * @throws {Error} - If there is an error verifying the token.
 */

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

/**
 * Authorize a user by verifying the JWT token in the request headers.
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 * @returns {Object} - The user object.
 * @throws {Error} - If the user is not authorized.
 */

async function authorizeUser(req) {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.userId);
    return user; // Return the user object if token is valid
  } catch (err) {
    return null; // Return null if token is invalid
  }
}

module.exports = {
  generateToken,
  verifyToken,
  verifyFirebaseToken,
  verifyGoogleToken,
  refreshToken,
  generateTestToken,
  generateTimedToken,
  authorizeUser,
};
