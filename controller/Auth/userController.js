/**
 * @file This file contains the user controller functions for authentication.
 * @module Auth/userController
 */

const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const User = require("../../models/userModel");
const brypt = require("bcrypt");
require("dotenv").config();
require("../../passport/passport.js");

const { generateToken, verifyToken } = require("../../utils/tokens");
const { comparePassword } = require("../../utils/passwords");
const {
  resetPasswordMail,
  getUsername,
  sendVerificationMail,
} = require("../../utils/mails");

const { validateEmail, validatePassword } = require("../../middlewares/auth");

/**
 * Checks if a user with the given username already exists.
 * @async
 * @function userExist
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Object} The response object.
 * @throws {Error} - The error message.
 */
async function userExist(req, res) {
  const { username } = req.params;
  const user = await User.findOne({ username });
  try {
    if (user) {
      return res.status(409).json({
        success: false,
        message: "Username already exists",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Username is available",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

/**
 * Creates a new user with the provided username, email, and password.
 * @async
 * @function signUp
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Object} The response object.
 * @throws {Error} - The error message.
 */

async function signUp(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { username, email, password } = req.body;
  try {
    //validate email
    if (!validateEmail(email)) {
      return res.status(400).json({ message: "Invalid email address" });
    }
    let emailExist = await User.findOne({ email });
    if (emailExist) {
      return res.status(409).json({
        success: false,
        message: "Email already exists",
      });
    }
    let userExist = await User.findOne({ username });
    if (userExist) {
      return res.status(409).json({
        success: false,
        message: "Username already exists",
      });
    }

    //validate password
    if (!validatePassword(password)) {
      return res
        .status(400)
        .json({ message: "Password doesn't meet the requirements" });
    }

    const user = new User({ username, email, password, isVerified: false });
    //save user to database
    await user.save();

    //send verification email
    const token = await generateToken(user._id);
    await sendVerificationMail(email, token);

    //logins user
    const accessToken = await generateToken(user._id);

    //status
    return res.status(201).json({
      success: true,
      message: "User created successfully",
      accessToken,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

/**
 * Logs in a user with the provided username and password.
 * @async
 * @function login
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Object} The response object.
 */

async function login(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { usernameOrEmail, password } = req.body;
  //check if user exists
  const user = await User.findOne({
    $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
  });
  if (!user) {
    return res.status(404).json({
      success: false,
      message: "Invalid credentials, check username or password",
    });
  }
  //compare password
  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: "Invalid credentials, check username or password",
    });
  }
  //generate token
  const accessToken = await generateToken(user._id);
  return res.status(200).json({
    success: true,
    message: "Login successful",
    accessToken,
  });
}

/**
 * Sends a reset password email to the user with the provided username and email.
 * @async
 * @function forgotPassword
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Object} The response object.
 */

async function forgotPassword(req, res) {
  const { username, email } = req.body;
  //check if user exists
  const user = await User.findOne({ username });
  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }
  //generate token
  const token = await generateToken(user._id);

  //send email to user
  try {
    await resetPasswordMail(email, token);
    return res.status(200).json({
      success: true,
      message:
        "You'll get an email with a link to reset your password if the address you provided has been verified.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

/**
 * Sends an email to the user with the provided email containing their username.
 * @async
 * @function forgotUsername
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Object} The response object.
 */

async function forgotUsername(req, res) {
  const { email } = req.body;

  //send email to user
  try {
    await getUsername(email);
    return res.status(200).json({
      success: true,
      message:
        "You'll get an email with your username if the address you provided has been verified.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

/**
 * Resets the user's password using the provided token.
 * @async
 * @function resetPassword
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Object} The response object.
 * @throws {Error} - The error message.
 */
async function resetPassword(req, res) {
  const { password } = req.body;
  const { token } = req.params;
  //decode token
  const decoded = await verifyToken(token);
  if (!decoded) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
  try {
    const user = await User.findOne({ _id: decoded.userId });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    console.log(password);
    console.log(user.password);

    //compare passwords
    const isMatch = await comparePassword(password, user.password);
    if (isMatch) {
      return res.status(400).json({
        success: false,
        message: "New password cannot be the same as the old password",
      });
    }

    user.password = password;
    await user.save();
    return res.status(200).json({
      success: true,
      message: "Password reset successful",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

//change password
/**
 * Changes the user's password using the provided token.
 * @async
 * @function changePassword
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Object} The response object.
 * @throws {Error} - The error message.
 */

async function changePassword(req, res) {
  const { password } = req.body;
  const { oldPassword } = req.body;
  const token = req.headers.authorization.split(" ")[1];
  //decode token
  const decoded = await verifyToken(token);
  if (!decoded) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
  try {
    const user = await User.findOne({ _id: decoded.userId });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    const isMatch = await comparePassword(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Old password is incorrect",
      });
    }
    if (!validatePassword(password)) {
      return res
        .status(400)
        .json({ message: "Password doesn't meet the requirements" });
    }

    user.password = password;
    await user.save();
    return res.status(200).json({
      success: true,
      message: "Password change successful",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

//change Email
/**
 * Changes the user's email address.
 * @async
 * @function changeEmail
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Object} The response object.
 * @throws {Error} - The error message.
 */

async function changeEmail(req, res) {
  const { email, password } = req.body;
  if (!validateEmail(email)) {
    return res.status(400).json({ message: "Invalid email address" });
  }
  const token = req.headers.authorization.split(" ")[1];
  //decode token
  const decoded = await verifyToken(token);
  if (!decoded) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
  try {
    const user = await User.findOne({ _id: decoded.userId });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Password is incorrect",
      });
    }

    user.email = email;
    await user.save();
    //send verification email
    try {
      const newToken = await generateToken(user._id);
      await sendVerificationMail(email, newToken);
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
    return res.status(200).json({
      success: true,
      message: "Email change successful, please verify your new email address",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

//verify email
/**
 * Verifies the user's email address using the provided token.
 * @async
 * @function verifyEmail
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Object} The response object.
 * @throws {Error} - The error message.
 */
async function verifyEmail(req, res) {
  const token = req.params.token;
  //decode token
  const decoded = await verifyToken(token);
  if (!decoded) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
  try {
    const user = await User.findOne({ _id: decoded.userId });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    user.isVerified = true;
    await user.save();
    return res.status(200).json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

//resend verification email
/**
 * Resends a verification email to the user.
 * @async
 * @function resendVerification
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Object} The response object.
 * @throws {Error} - The error message.
 */

async function resendVerification(req, res) {
  const token = req.headers.authorization.split(" ")[1];
  //decode token
  const decoded = await verifyToken(token);
  if (!decoded) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
  const user = await User.findOne({ _id: decoded.userId });
  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }
  //send verification email
  try {
    const newToken = await generateToken(user._id);
    await sendVerificationMail(user.email, newToken);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
  return res.status(200).json({
    success: true,
    message: "Verification email sent successfully",
  });
}

module.exports = {
  userExist,
  signUp,
  login,
  forgotPassword,
  forgotUsername,
  resetPassword,
  changePassword,
  changeEmail,
  verifyEmail,
  resendVerification,
};
