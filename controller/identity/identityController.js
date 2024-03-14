require("dotenv").config();
const User = require("../../models/user");
const UserPreferences = require("../../models/userPreferences");

// this function returns the user's information
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


// this function returns the user's preferences
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


// this function updates the user's preferences
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
    autoplayMedia, } = req.body;
   try {
    const user = await User.findOne({username});
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const preferences = await UserPreferences.findOneAndUpdate(
      { user: user._id },
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
        autoplayMedia
      },
      { new: true, upsert: true }
    );

    res.json(preferences);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
}

module.exports = { getMe, getUserPreferences, updateUserPreferences};