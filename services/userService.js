const Service = require("./service");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const Community = require("../models/communityModel");

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
    subreddits = subreddits.map((el) => el.communityId);
    return subreddits.includes(subreddit);
  };

  /**
 * add friend of user
 * @param {String} (username)
 * @param {String} (friend)
 * @function
 */
  addFriend = async (username, friend) => {
    await this.updateOne(
      { _id: username },
      {
        $addToSet: {
          friendRequestFromMe: friend,
        },
      }
    );
    await this.updateOne(
      { _id: friend },
      {
        $addToSet: {
          friendRequestToMe: username,
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
      { _id: username },
      {
        $pull: {
          friend: friend,
        },
      }
    );
  };
  
}
module.exports = UserService;
