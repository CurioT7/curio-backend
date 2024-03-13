// Purpose: Provide functions for hashing, comparing, and generating passwords.
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const generator = require("generate-password");

/**
 * Password utility functions.
 * @module utils/passwords
 */

/**
 * Hash a password using bcrypt.
 * @async
 * @function hashPassword
 * @param {string} password - The password to hash.
 * @returns {Promise<string>} - A promise that resolves with the hashed password.
 * @throws {Error} - If the password is not provided.
 */

async function hashPassword(password) {
  try {
    if (!password) {
      throw new Error("Password is required");
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  } catch (error) {
    throw new Error(error);
  }
}

/**
 * Compare a password with a hashed password.
 * @async
 * @function comparePassword
 * @param {string} password - The password to compare.
 * @param {string} hashedPassword - The hashed password to compare against.
 * @returns {Promise<boolean>} - A promise that resolves with a boolean indicating if the password matches the hashed password.
 * @throws {Error} - If the password or hashed password are not provided.
 */
async function comparePassword(password, hashedPassword) {
  try {
    if (!password || !hashedPassword) {
      throw new Error("Password and hashed password are required");
    }
    const isMatch = await bcrypt.compare(password, hashedPassword);
    return isMatch;
  } catch (error) {
    throw new Error(error);
  }
}

/**
 * Generate a random password using the generate-password package.
 * @function generatePassword
 * @returns {string} - The generated password.
 */

function generatePassword() {
  return generator.generate({
    length: 10,
    numbers: true,
    uppercase: true,
    Symbols: true,
  });
}

module.exports = { hashPassword, comparePassword, generatePassword };
