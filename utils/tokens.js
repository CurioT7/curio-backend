const { v4: uuidv4 } = require("uuid");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const user = require("../models/user");

async function generateToken(userId) {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "24h" });
};


async function verifyToken(token) {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    return payload;
}

module.exports = { generateToken, verifyToken };

