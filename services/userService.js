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
 * isModeratorInSubreddit
 * @param {String} (subreddit)
 * @param {String} (user)
 * @function
 */
  isModeratorInSubreddit = async (subreddit, user) => {
    let subreddits = (await this.getOne({ _id: user, select: "moderators" }))
      .moderators;
    subreddits = subreddits.map((el) => el.communityName);
    return subreddits.includes(subreddit);
  };
 /**
 * follow Subreddits
 * @param {String} (username)
 * @param {String} (communityName)
 * @function
 */
 followSubreddits = async (username, communityName) => {
  await this.updateOne(
      { username: username },
      {
          $addToSet: {
            countSubreddits: communityName,
          },
      }
  )
};

/**
 * delete friend of user 
 * @param {String} (username)
 * @param {String} (communityName)
 * @function
 */
unFollowSubreddits = async (username, communityName) => {
  await this.updateOne(
    { username: username },
    {
      $pull: {
        countSubreddits: communityName,
      },
    }
  );
};
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
