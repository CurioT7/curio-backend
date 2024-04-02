/**
 * @file This file contains controller functions related to user actions such as blocking and unblocking users.
 * @module user/blockUserController
 */

const User = require("../../models/userModel");
const block = require("../../models/blockModel");
const { generateToken, verifyToken } = require("../../utils/tokens");

require("dotenv").config();

/**
 * @description Blocks a user based on the provided username to block.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */

async function blockUser(req, res) {
  const token = req.headers.authorization.split(" ")[1];
  const decoded = await verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const usernameToBlock = req.body.usernameToBlock;
  try {
    const blockingUser = await User.findOne({ username: usernameToBlock });
    if (!blockingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const blockedUser = await User.findOne({ username: usernameToBlock });
    if (!blockedUser) {
      return res.status(404).json({ message: "User to block not found" });
    }

    const existingBlock = await block.findOne({
      blockerId: blockingUser._id,
      blockedId: blockedUser._id,
    });

    if (existingBlock) {
      const lastUnblockTimestamp = existingBlock.unblockTimestamp || 0; // Get last unblock time (0 if never unblocked)
      const timeSinceUnblock = Date.now() - lastUnblockTimestamp;
      const cooldownTime = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

      if (timeSinceUnblock < cooldownTime) {
        return res
          .status(403)
          .json({
            message:
              "You can't block the user for 24 hours after unblocking them",
          });
      }

      existingBlock.unblockTimestamp = null;
      await existingBlock.save();
    }

    const newBlock =
      existingBlock ||
      new block({ blockerId: blockingUser._id, blockedId: blockedUser._id });
    await newBlock.save();

    res.json({ message: "User successfully blocked" });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

/**
 * @description Unblocks a user based on the provided username to unblock.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function unblockUser(req, res) {
  const token = req.headers.authorization.split(" ")[1];
  const decoded = await verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const usernameToUnblock = req.body.usernameToUnblock;
  try {
    const blocker = await User.findOne({ username: usernameToUnblock });
    if (!blocker) {
      return res.status(404).json({ message: "User not found" });
    }

    const unblockedUser = await User.findOne({ username: usernameToUnblock });
    if (!unblockedUser) {
      return res.status(404).json({ message: "User to unblock not found" });
    }

    const existingBlock = await block.findOne({
      blockerId: blocker._id,
      blockedId: unblockedUser._id,
    });

    if (!existingBlock) {
      return res.status(409).json({ message: "User not blocked" });
    }

    existingBlock.unblockTimestamp = Date.now();
    await existingBlock.save();

    res.json({ message: "User successfully unblocked" });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

module.exports = { blockUser, unblockUser };
