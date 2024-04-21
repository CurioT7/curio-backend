/**
 * Validates an email address using a regular expression.
 * @param {string} email - The email address to validate.
 * @returns {boolean} - True if the email address is valid, otherwise false.
 */ function validateEmail(email) {
  const emailRegex = /^[^\s@]+(?:\.[^\s@]+)*@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates a password against a regular expression pattern.
 * The password must contain at least one letter, one digit, and be at least 8 characters long.
 * @param {string} password - The password to validate.
 * @returns {boolean} - True if the password is valid, otherwise false.
 */
function validatePassword(password) {
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
  return passwordRegex.test(password);
}

const { verifyToken } = require("../utils/tokens");

/**
 * Middleware to authenticate a user using a JWT token.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {function} next - Express next function.
 */

async function authenticate(req, res, next, isOptional = false) {
  try {
    if (!req.headers.authorization) {
      if (isOptional) {
        return next();
      }
      return res.status(401).json({ message: "Unauthorized" });
    }

    const token = req.headers.authorization.split(" ")[1];
    const decoded = await verifyToken(token);

    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    req.user = decoded;
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = { validateEmail, validatePassword, authenticate };
