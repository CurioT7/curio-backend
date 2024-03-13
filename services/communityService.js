const Service = require("./service");
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
    var subre = await this.getOne({ _id: subreddit });
    if (subre) {
      return {
        state: false,
        subreddit: subre,
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
}

module.exports = CommunityService;
