const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const User = require("../../models/user");
const Community = require("../../models/subredditsModel");
require("dotenv").config();
const  { addUserToSubbreddit } = require("./friendController");

  /**
   * Check whether subreddit is available or not
   * @param {string} subreddit 
   * @returns {object} {state and subreddit}
   * @function
   */
  async function availableSubreddit(subreddit) {
    try {
        const subReddit = await User.findOne({ name: subreddit });
        if (subReddit) {
            return {
                state: false,
                subreddit: subReddit.name,
            };
        } else {
            return {
                state: true,
                subreddit: null,
            };
        }
    } catch (error) {
        console.error("Error checking subreddit availability:", error);
        return {
            state: false,
            subreddit: null,
            error: "An error occurred while checking subreddit availability",
        };
    }
  };
 /**
   * Create subreddit
   * @param {string} data contain 
   * @param {string} user user information
   * @return {Object} state
   * @function
   */

  async function createSubreddit(data, user) {
    const subredditName = data.name;
    const username = user.username;
    const communityName = `${subredditName}_${username}`;

    const subredditAvailable = await availableSubreddit(subredditName);
    if (!subredditAvailable.state) {
      return {
        status: false,
        error: "Subreddit with this name already exists",
      };
    }

    const moderator = {
      subreddit: subredditName,
      username: username,
      role: "creator",
    };
    const member = {
      subreddit: subredditName,
      username: username,
    };
    const newSubreddit = {
      name: subredditName,
      isOver18: data.over18,
      description: data.description,
      isPrivate: data.type,
      moderators: [moderator],
      members: [member],
    };

    try {
      await Community.create(newSubreddit);

      await User.findOneAndUpdate(
        { username: username },
        {
          $push: {
            subreddits: {
              subreddit: subredditName, 
              role: "creator",
            },
            members: { subreddit: subredditName },
            moderators: { subreddit: subredditName },
          },
        }
      );

      return {
        status: true,
        response: "Subreddit created successfully",
        communityName: communityName, 
      };
    } catch (error) {
      console.error(error);
      return {
        status: false,
        error: "Failed to create subreddit",
      };
    }
  }
/**
 * Create subreddit
 * @param {Object} req Express request object
 * @param {Object} res Express response object
 * @returns {Object} Response object
 */
async function createSub(req, res) {
  try {
    const username = req.body.username;
    const user = await User.findOne({ username });

    
    if (!user) {
      return res.status(404).json({
        status: "failed",
        message: "User not found",
      });
    }

    const result = await createSubreddit(req.body, user); 
    if (!result.status) {
      return res.status(200).json({
        status: result.error,
      });
    }

    const updateUser = await addUserToSubbreddit(user, result.response.communityName); 
   

    return res.status(200).json({
      status: result.response,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: "failed",
      message: "An error occurred",
    });
  }
}

module.exports = {
  createSub,
  availableSubreddit,
  createSubreddit,
};
