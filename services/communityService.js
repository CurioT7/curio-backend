const Service = require("./service");
const Community = require("../models/subredditsModel");

/**
 * Service class to handle Community manipulations.
 * @class CommunityService
 */
class CommunityService extends Service {
  constructor(model) {
    super(model);
  }

  /**
   * Check whether subreddit is available or not
   * @param {string} subreddit 
   * @returns {object} {state and subreddit}
   * @function
   */
  availableSubreddit = async (subreddit) => {
    var subReddit = await this.getOne({ _id : subreddit });
    if (subReddit) {
      return {
        state: false,
        subreddit: subReddit,
      };
    } else {
      return {
        state: true,
        subreddit: null,
      };
    }
  };
  /**
     * invite user to be moderator in subreddit
     * @param {string} subreddit
     * @param {string} moderator
     * @function
     */
  inviteModerator = async (subreddit, moderator) => {
    const doc = await this.getOne({ _id: subreddit });
    doc.invitedModerators.push(moderator);
    await doc.save();
  };
  /**
     * deinvite user to be moderator in subreddit
     * @param {string} subreddit
     * @param {string} moderator
     * @function
     */
  deInviteModerator = async (subreddit, moderator) => {
    const doc = await this.getOne({ _id: subreddit });
    doc.invitedModerators = doc.invitedModerators.filter(
      (el) => el != moderator
    );
    await doc.save();
  };

  /**
   * check if user is moderatot in subreddit
   * @param {string} subreddit
   * @param {string} moderator
   * @function
   */
  isInvited = async (subreddit, user) => {
    const invitedModerators = (
      await this.getOne({ _id: subreddit, select: "invitedModerators" })
    ).invitedModerators;
    return invitedModerators.includes(user);
  };
  
  async createSubreddit(data, user) {
    const subredditName = data.name;
    const username = user.username;
    const communityName = `${subredditName}_${username}`;

    // Check if the communityName is already in use
    const communityExists = await this.communityNameExists(communityName);
    if (communityExists) {
      return {
        status: false,
        error: "Community with this name already exists",
      };
    }

    // Create the subreddit
    const moderator = {
      userID: username,
      role: "creator",
    };
    const memInComm = {
      userID: username,
    };
    const newSubreddit = {
      _id: subredditName,
      over18: data.over18,
      privacyType: data.type,
      moderators: [moderator],
      members: [memInComm],
    };

    try {
      await this.insert(newSubreddit);
      return {
        status: true,
        response: "Subreddit created successfully",
        communityName: communityName, // Include the generated communityName in the response
      };
    } catch (error) {
      console.error(error);
      return {
        status: false,
        error: "Failed to create subreddit",
      };
    }
  }

  async communityNameExists(communityName) {
    const existingCommunity = await Community.findOne({ communityName });
    return !!existingCommunity;
  }
}


module.exports = CommunityService;
