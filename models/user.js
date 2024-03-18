const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const { hashPassword } = require("../utils/passwords");


/**
 * Schema definition for a user in the Reddit-like application.
 * @typedef {Object} UserSchema
 * @property {string} googleId - Google ID of the user (if signed up via Google).
 * @property {string} username - Username of the user.
 * @property {string} email - Email address of the user.
 * @property {string} password - Hashed password of the user.
 * @property {Date} createdAt - Date and time when the user account was created.
 * @property {boolean} isVerified - Indicates whether the user's email has been verified.
 * @property {string} gender - Gender of the user (optional).
 * @property {string} language - Preferred language of the user (optional).
 */

/**
 * Schema definition for a user in the Reddit-like application.
 * @type {UserSchema}
 */
 
 const userSchema = new mongoose.Schema({
  googleId: {
    type: String,
    trim: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  gender: {
    type: String,
    required: false,
  },
  language: {
    type: String,
    required: false,
  },
});

// Hash the password before saving the user to the database
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  try {
    const hashedPassword = await hashPassword(this.password);
    this.password = hashedPassword;
    next();
  } catch (error) {
    next(error);
  }
});

const User = mongoose.model("User", userSchema);

module.exports = User;
