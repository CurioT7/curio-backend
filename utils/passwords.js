const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const generator = require("generate-password");

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

function generatePassword() {
  return generator.generate({
    length: 10,
    numbers: true,
    uppercase: true,
    Symbols: true,
  });
}

module.exports = { hashPassword, comparePassword, generatePassword };
