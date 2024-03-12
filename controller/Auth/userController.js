const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const User = require("../../models/userModel");
const brypt = require("bcrypt");
require("dotenv").config();

const { hashPassword, comparePassword } = require("../../utils/passwords");

async function signUp(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { username, email, password } = req.body;
  //check if user already exists
  const userExist = await User.findOne({ username });
  if (userExist) {
    return res.status(409).json({
      success: false,
      message: "Username already exists",
    });
  }
  try {
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

module.exports = { signUp };
