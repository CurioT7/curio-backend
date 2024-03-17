const Service = require("./service");
const Community = require("../models/subredditsModel");
const User = require("../models/user");

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
    try {
        const subReddit = await this.getOne({ name: subreddit });
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
async createSubreddit(data, user) {
  const subredditName = data.name;
  const username = user.username;
  const communityName = `${subredditName}_${username}`;

  // Check if the subreddit name is available
  const subredditAvailable = await this.availableSubreddit(subredditName);
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
    await this.insert(newSubreddit);

    // Update the user model
    await User.findOneAndUpdate(
      { username: username },
      {
        $push: {
          subreddits: {
            subreddit: subredditName, // Assuming _id is the ObjectId of the newly created subreddit
            role: "creator",
          },
          countSubreddits: subredditName,
          members: { subreddit: subredditName },
          moderators: { subreddit: subredditName },
        },
      }
    );

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

}


module.exports = CommunityService;
