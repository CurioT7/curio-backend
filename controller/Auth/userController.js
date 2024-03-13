const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const User = require("../../models/user");
const brypt = require("bcrypt");
require("dotenv").config();
require("../../passport/passport.js");

const { generateToken } = require("../../utils/tokens");
const { hashPassword, comparePassword } = require("../../utils/passwords");
const { resetPassword, getUsername } = require("../../utils/mails");

//check if user exists
async function userExist(req, res) {
  const { username } = req.body;
  const user = await User.findOne({ username });
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
}

async function signUp(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { username, email, password } = req.body;
  try {
    let userExist = await User.findOne({ username });
    if (userExist) {
      return res.status(409).json({
        success: false,
        message: "Username already exists",
      });
    }
    const user = new User({ username, email, password });
    //save user to database
    await user.save();
    //status
    return res.status(201).json({
      success: true,
      message: "User created successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

async function login(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { username, password } = req.body;
  //check if user exists
  const user = await User.findOne({ username });
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
  const token = await generateToken(user._id);
  return res.status(200).json({
    success: true,
    message: "Login successful",
    token,
  });
}

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
    await resetPassword(email, token);
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

module.exports = { userExist, signUp, login, forgotPassword, forgotUsername };
