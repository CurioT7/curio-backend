/**
 * @file This file contains the identity controller function and other user settings functions.
 * @module identity/identutyController
 */

const User = require("../../models/userModel");
const UserPreferences = require("../../models/userPreferences");
const Subreddit = require("../../models/subredditModel");
const { generateToken, verifyToken } = require("../../utils/tokens");
const { comparePassword } = require('../../utils/passwords');
require("dotenv").config();

/**
 * @description Fetches user information based on the provided username.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */

async function getMe(req, res) {
  const token = req.headers.authorization.split(" ")[1];
  const decoded = await verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const userExists = await User.findOne({ _id: decoded.userId });
    if (!userExists) {
      return res.status(404).json({ message: "User not found" });
    }
    const response = {
      username: userExists.username,
      gender: userExists.gender || "N/A",
      language: userExists.language || "N/A",
      email: userExists.email || "N/A",
      isVerified: userExists.isVerified,
    };

    res.json(response);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

/**
 * @description Fetches user preferences based on the provided username.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getUserPreferences(req, res) {
  const token = req.headers.authorization.split(" ")[1];
  const decoded = await verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const user = await User.findOne({ _id: decoded.userId });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const preferences = await UserPreferences.findOne({
      username: user.username,
    })
      .populate({
        path: "block.username", // Populate username details in blocked users
        select: "username", // Only select username from User model in blocked users
      })
      .populate({
        path: "mute.username", // Populate username details in muted users
        select: "username", // Only select username from User model in muted users
      });

    if (!preferences) {
      return res.status(404).json({ message: "User preferences not found" });
    }

    res.json(preferences);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
}

/**
 * @description Updates user preferences based on the provided username and preferences data.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */

async function updateUserPreferences(req, res) {
  const token = req.headers.authorization.split(" ")[1];
  const decoded = await verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const user = await User.findOne({ _id: decoded.userId });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const updateFields = {};
  const preferencesFields = [
    "gender",
    "language",
    "locationCustomization",
    "displayName",
    "about",
    "socialLinks",
    "images",
    "NSFW",
    "allowFollow",
    "contentVisibility",
    "activeInCommunityVisibility",
    "clearHistory",
    "block",
    "viewBlockedPeople",
    "mute",
    "viewMutedCommunities",
    "adultContent",
    "autoplayMedia",
    "communityThemes",
    "communityContentSort",
    "globalContentView",
    "rememberPerCommunity",
    "openPostsInNewTab",
    "mentions",
    "comments",
    "upvotesPosts",
    "upvotesComments",
    "replies",
    "newFollowers",
    "postsYouFollow",
    "newFollowerEmail",
    "chatRequestEmail",
    "unsubscribeFromAllEmails",
  ];

  preferencesFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      updateFields[field] = req.body[field];
    }
  });

  try {
    const preferences = await UserPreferences.findOneAndUpdate(
      { username: user.username },
      updateFields,
      { new: true, upsert: true }
    );

    res.json({ preferences, message: "User preferences updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
}

/**
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - A response object
 * @description Mutes a community for a user
 */

async function muteCommunity (req, res) {
  const token = req.headers.authorization.split(" ")[1];
  const decoded = await verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  const communityToMute = req.body.communityToMute;
  try {
    const user = await User.findOne({ _id: decoded.userId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const community = await Subreddit.findOne({ name: communityToMute});
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }
    const userPreferences = await UserPreferences.findOne({ username: user.username });
   
    const communityName = community.name;
    
    const isCommunityMuted = userPreferences.viewMutedCommunities.some(item => item.communityName === communityName);

    if (isCommunityMuted) {
      return res.status(409).json({ message: 'Community already muted' });
    }
    
    userPreferences.viewMutedCommunities.push({ communityName: community.name });
    
    await userPreferences.save();
    

    res.json({ message: 'Community successfully muted' });
  }
  catch (error) {
    return res.status(500).json({ 
      success: false,
      message: error.message
    });
  }
}


/**
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - A response object
 * @description Unmutes a community for a user
 */

async function unmuteCommunity (req, res) {
  const token = req.headers.authorization.split(" ")[1];
  const decoded = await verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  const communityToUnmute = req.body.communityToUnmute;
  try {
    const user = await User.findOne({ _id: decoded.userId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const community = await Subreddit.findOne({ name: communityToUnmute});
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }
    const userPreferences = await UserPreferences.findOne({ username: user.username });
   
    const communityName = community.name;
    
    const isCommunityMuted = userPreferences.viewMutedCommunities.some(item => item.communityName === communityName);

    if (!isCommunityMuted) {
      return res.status(409).json({ message: 'Community not muted' });
    }
    
    // Remove the community from the user's muted communities
    userPreferences.viewMutedCommunities = userPreferences.viewMutedCommunities.filter(item => item.communityName !== communityName);
    await userPreferences.save();
    
    res.json({ message: 'Community successfully unmuted' });
  }
  catch (error) {
    return res.status(500).json({ 
      success: false,
      message: error.message
    });
  }
 
}

/**
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - A response object
 * @description Deletes a user account
 */


async function deleteAccount (req, res) {
  const token = req.headers.authorization.split(" ")[1];
  const decoded = await verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  const { usernametodelete , password } = req.body;
  try {
    const user = await User.findOne({ _id: decoded.userId });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
         });
    }
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }
     await UserPreferences.findOneAndDelete({ username: user.usernametodelete });
     await User.findOneAndDelete({ _id: decoded.userId });
     res.json({ message: 'Account successfully deleted' });
  }
  catch (error) {
    return res.status(500).json({ 
      success: false,
      message: error.message
    });
  }
}

module.exports = { getMe, getUserPreferences, updateUserPreferences, muteCommunity, unmuteCommunity, deleteAccount };
