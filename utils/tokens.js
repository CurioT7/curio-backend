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
  const payload = jwt.verify(token, process.env.JWT_SECRET);
  return payload;
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

module.exports = { generateToken, verifyToken, verifyFirebaseToken };
