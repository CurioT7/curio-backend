/**
 * @file This file contains the identity controller function and other user settings functions.
 * @module identity/identutyController
 */

const User = require("../../models/user");
const UserPreferences = require("../../models/userPreferences");
require("dotenv").config();


/**
 * @description Fetches user information based on the provided username.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */

async function getMe(req, res) {
  const {username} = req.body;

  try {
    const userExists = await User.findOne({ username }); 
    if (!userExists) {
      return res.status(404).json({ message: 'User not found' });
    }
    const response = {
        username: userExists.username,
        gender: userExists.gender ||'N/A',
        language: userExists.language || 'N/A',
        email: userExists.email || 'N/A' 
      };
  
      res.json(response);

    } 
    catch (error) {
         return res.status(500).json({ 
            success: false,
            message: error.message });
     }
    

};


/**
 * @description Fetches user preferences based on the provided username.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getUserPreferences(req, res) {
  const {username} = req.body;
  try {
    const user = await User.findOne({username});
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const preferences = await UserPreferences.findOne({ username: user.username   })
    .populate({
      path: 'block.username', // Populate username details in blocked users
      select: 'username' // Only select username from User model in blocked users
    })
    .populate({
      path: 'mute.username', // Populate username details in muted users
      select: 'username' // Only select username from User model in muted users
    });
    
    
    if (!preferences) {
      return res.status(404).json({ message: 'User preferences not found' });
    }

    res.json(preferences);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @description Updates user preferences based on the provided username and preferences data.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */

async function updateUserPreferences(req, res) {
  const {username} = req.body;
  const {
    displayName,
    about,
    socialLinks,
    images,
    NSFW,
    allowFollow,
    contentVisibility,
    activeInCommunityVisibility,
    clearHistory,
    block,
    viewBlockedPeople,
    mute,
    viewMutedCommunities,
    adultContent,
    autoplayMedia,
    communityThemes,
    communityContentSort,
    globalContentView,
    rememberPerCommunity,
    openPostsInNewTab, 
    mentions, 
    comments,
    upvotes, 
    replies,
    newFollowers,
    invitations,
    postsYouFollow,
    newFollowerEmail,
    chatRequestEmail,
    unsubscribeFromAllEmails
   } = req.body;
   try {
    const user = await User.findOne({username});
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const preferences = await UserPreferences.findOneAndUpdate(
      { username},
      {
        displayName,
        about,
        socialLinks,
        images,
        NSFW,
        allowFollow,
        contentVisibility,
        activeInCommunityVisibility,
        clearHistory,
        block,
        viewBlockedPeople,
        mute,
        viewMutedCommunities,
        adultContent,
        autoplayMedia,
        communityThemes,
        communityContentSort,
        globalContentView,
        rememberPerCommunity,
        openPostsInNewTab,
        mentions,
        comments,
        upvotes,
        replies,
        newFollowers,
        invitations,
        postsYouFollow,
        newFollowerEmail,
        chatRequestEmail,
        unsubscribeFromAllEmails,
      },
      { new: true, upsert: true }
    );

    res.json({ preferences, message: 'User preferences updated successfully' });
    preferences.save();

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
}

module.exports = { getMe, getUserPreferences, updateUserPreferences};