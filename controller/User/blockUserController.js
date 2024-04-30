/**
 * @file This file contains controller functions related to user actions such as blocking and unblocking users.
 * @module user/blockUserController
 */

const User = require("../../models/userModel");
const block = require("../../models/blockModel");
const UserPreferences = require("../../models/userPreferencesModel");
const { generateToken, verifyToken } = require("../../utils/tokens");

require("dotenv").config();

/**
 * @description Blocks a user based on the provided username to block.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */

async function blockUser(req, res) {
  try {
    const usernameToBlock = req.body.usernameToBlock;
    if (req.user) {
      const user = await User.findOne({ _id: req.user.userId });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
    const preferences = await UserPreferences.findOne({
      username: user.username,
    });

    const blockedUser = await User.findOne({ username: usernameToBlock });
    if (!blockedUser) {
      return res.status(404).json({ message: "User to block not found" });
    }     

    const existingBlock = await block.findOne({
      blockerId: user._id,
      blockedId: blockedUser._id,
      blockedUsername: blockedUser.username,
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
      new block({ blockerId: user._id, blockedId: blockedUser._id, blockedUsername: blockedUser.username, });
      newBlock.blockUsername = blockedUser.username;
      await newBlock.save();

      await UserPreferences.updateOne(
        { username: user.username },
        {
          $push: {
            viewBlockedPeople: {
              blockedUsername: blockedUser.username,

            },
          },
        }
      );
      if (preferences){
        await preferences.save();
      }

    res.json({ message: "User successfully blocked" });
    }
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
  try {
    if (req.user) {
      const user = await User.findOne({ _id: req.user.userId });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
    const usernameToUnblock = req.body.usernameToUnblock;
    const preferences = await UserPreferences.findOne({
      username: user.username,
    })

    const unblockedUser = await User.findOne({ username: usernameToUnblock });
    if (!unblockedUser) {
      return res.status(404).json({ message: "User to unblock not found" });
    }

    const existingBlock = await block.findOne({
      blockerId: user._id,
      blockedId: unblockedUser._id,
    });

    if (!existingBlock) {
      return res.status(409).json({ message: "User not blocked" });
    }

    existingBlock.unblockTimestamp = Date.now();
    await existingBlock.save();

    await UserPreferences.updateOne(
      { username: user.username },
      {
        $pull: {
          viewBlockedPeople: {
            blockedUsername: unblockedUser.username,
          },
        },
      }
    );
    if (preferences) {
      await preferences.save();
    }
    console.log(preferences);

    res.json({ message: "User successfully unblocked" });
  }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

module.exports = { blockUser, unblockUser };
