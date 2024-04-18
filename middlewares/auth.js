const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const { verifyToken } = require("../utils/tokens");

//protected route
const auth = async (req, res, next) => {
  try {
    const token = req.header.authorization.split(" ")[1];
    const payload = await verifyToken(token);
    const user = await User.findOne({
      _id: payload.userId,
    });

    if (!user) {
      res.status(401).send({ error: "Not authorized to access this resource" });
    }

    next();
  } catch (error) {
    res.status(401).send({ error: "Not authorized to access this resource" });
  }
};

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

module.exports = { validateEmail, validatePassword, auth };
