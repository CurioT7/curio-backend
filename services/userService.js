const Service = require("./service");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const Community = require("../models/subredditsModel");

/**
 * Service class to handle User manipulations.
 * @class UserService
 */
class UserService extends Service {
  constructor(model) {
    super(model);
  }

 /**
 * follow Subreddits
 * @param {String} (username)
 * @param {String} (communityName)
 * @function
 */
 async followSubreddits(username, communityName) {
  try {
    // Update the user model
    await User.findOneAndUpdate(
      { username: username },
      {
        $addToSet: {
          subreddits: {
            subreddit: communityName,
            role: "member", // Assuming the user is a member when they follow a subreddit
          },
        },
      }
    );

    // Update the members schema
    await this.updateOne(
      { username: username },
      {
        $addToSet: {
          member: {
            subreddit: communityName,
          },
        },
      }
    );
    await Community.findOneAndUpdate(
      { name: communityName },
      {
        $addToSet: {
          members: { username: username },
        },
      }
    );


    return {
      status: true,
      response: "Subreddit followed successfully",
      communityName: communityName,
    };
  } catch (error) {
    console.error("Error following subreddit:", error);
    return {
      status: false,
      error: "Failed to follow subreddit",
    };
  }
}


/**
 * delete friend of user 
 * @param {String} (username)
 * @param {String} (communityName)
 * @function
 */
async unFollowSubreddits(username, communityName) {
  try {
    // Update the user model
    await User.findOneAndUpdate(
      { username: username },
      {
        $pull: {
          subreddits: { subreddit: communityName },
        },
      }
    );

    // Update the members schema
    await this.updateOne(
      { username: username },
      {
        $pull: {
          member: { subreddit: communityName },
        },
      }
    );
    await Community.findOneAndUpdate(
      { name: communityName },
      {
        $pull: {
          members: { username: username },
        },
      }
    );

    return {
      status: true,
      response: "Subreddit unfollowed successfully",
      communityName: communityName,
    };
  } catch (error) {
    console.error("Error unfollowing subreddit:", error);
    return {
      status: false,
      error: "Failed to unfollow subreddit",
    };
  }
}

  /**
 * add friend of user
 * @param {String} (username)
 * @param {String} (friend)
 * @function
 */
  addFriend = async (username, friend) => {
    await this.updateOne(
        { username: username },
        {
            $addToSet: {
              followings: friend,
            },
        }
    );
    await this.updateOne(
        { username: friend },
        {
            $addToSet: {
              followers: username,
            },
        }
    );
    
  };

  /**
   * delete friend of user 
   * @param {String} (username)
   * @param {String} (friend)
   * @function
   */
  deleteFriend = async (username, friend) => {
    await this.updateOne(
      { username: username },
      {
        $pull: {
          followings: friend,
        },
      }
    );
    await this.updateOne(
      { username: friend },
      {
        $pull: {
          followers: username,
        },
      }
    );
  };
  /**
   * Add user to community
   * @param {String} (username)
   * @param {String} (communityName)
   * @returns {object} mentions
   * @function
   */
  addUserToSubbreddit = async (user, communityName) => {
    const userModerator = {
      communityName: communityName,
      role: "creator",
    };
    const userMember = {
      communityName: communityName,
    };
    const modarr = user.moderators;
    modarr.push(userModerator);
    const memarr = user.member;
    memarr.push(userMember);
    try {
      await this.updateOne(
        { username: user.username },
        { moderators: modarr, member: memarr }
      );
    } catch {
      return {
        status: false,
        error: "operation user",
      };
    }
    return {
      status: true,
    };
  };
}
module.exports = UserService;
