const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const User = require("../../models/userModel");
const Community = require("../../models/subredditModel");
const brypt = require("bcrypt");
const { verifyToken } = require("../../utils/tokens");

require("dotenv").config();

// }
/**
 * follow Subreddits
 * @param {String} (username)
 * @param {String} (communityName)
 * @function
 */
async function followSubreddits(username, communityName) {
  try {
    await User.findOneAndUpdate(
      { username: username },
      {
        $addToSet: {
          subreddits: {
            subreddit: communityName,
            role: "member",
          },
        },
      }
    );

    await User.findOneAndUpdate(
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
 * unfollow a subreddit
 * @param {String} (username)
 * @param {String} (communityName)
 * @function
 */
async function unFollowSubreddits(username, communityName) {
  try {
    await User.findOneAndUpdate(
      { username: username },
      {
        $pull: {
          subreddits: { subreddit: communityName },
        },
      }
    );

    await User.findOneAndUpdate(
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
async function addFriend(username, friend) {
  await User.findOneAndUpdate(
    { username: username },
    {
      $addToSet: {
        followings: friend,
      },
    }
  );
  await User.findOneAndUpdate(
    { username: friend },
    {
      $addToSet: {
        followers: username,
      },
    }
  );
}

/**
 * delete friend of user
 * @param {String} (username)
 * @param {String} (friend)
 * @function
 */
async function deleteFriend(username, friend) {
  await User.findOneAndUpdate(
    { username: username },
    {
      $pull: {
        followings: friend,
      },
    }
  );
  await User.findOneAndUpdate(
    { username: friend },
    {
      $pull: {
        followers: username,
      },
    }
  );
}

/**
 * Add user to community
 * @param {String} (username)
 * @param {String} (communityName)
 * @returns {object} mentions
 * @function
 */
async function addUserToSubbreddit(user, communityName) {
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
    await User.findOneAndUpdate(
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
}

/**
 * friend request to add friendship or moderator_deInvite
 * @param {function} (req,res)
 * @returns {object} res
 */
async function friendRequest(req, res) {
  const token = req.headers.authorization.split(" ")[1];
  const decoded = await verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const friendname = req.body.friendUsername;

  try {
    const user = await User.findOne({ _id: decoded.userId });

    if (!user) {
      return res.status(404).json({
        status: "failed",
        message: "User not found",
      });
    }

    const friend = await User.findOne({ username: friendname });

    if (!friend) {
      return res.status(404).json({
        status: "failed",
        message: "User to be followed not found",
      });
    }

    await addFriend(user.username, friendname);

    return res.status(200).json({
      status: "success",
      message: "Friend added successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

/**
 * unfriend request to remove friendship or moderator_deInvite
 * @param {function} (req,res)
 * @returns {object} res
 */
async function unFriendRequest(req, res) {
  const token = req.headers.authorization.split(" ")[1];
  const friendname = req.body.friendUsername;
  const decoded = await verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const user = await User.findOne({ _id: decoded.userId });

    if (!user) {
      return res.status(404).json({
        status: "failed",
        message: "User not found",
      });
    }

    const friend = await User.findOne({ username: friendname });

    if (!friend) {
      return res.status(404).json({
        status: "failed",
        message: "User to be deleted not found",
      });
    }

    await deleteFriend(user.username, friendname);

    return res.status(200).json({
      status: "success",
      message: "Friend deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

/**
 * get user information
 * @param {function} (req,res)
 * @returns {object} res
 */
async function getUserInfo(req, res) {
  const username = req.body.username;
  const user = await User.findOne({ username });
  if (!user) {
    return res.status(404).json({
      status: "failed",
      message: "not found this user",
    });
  } else {
    return res.status(200).json({
      id: user._id,
      username: user.username,
      about: user.about,
      avatar: user.avatar,
    });
  }
}

/**
 * unfollow a subreddit
 * @param {String} (username)
 * @param {String} (communityName)
 * @function
 */

async function unFollowSubreddit(req, res) {
  try {
    const { username, subreddit } = req.body;

    const userExists = await User.findOne({ username });
    if (!userExists) {
      return res.status(404).json({
        status: "failed",
        message: "Username not found",
      });
    }

    const subredditExists = await Community.findOne({ name: subreddit });
    if (!subredditExists) {
      return res.status(404).json({
        status: "failed",
        message: "Subreddit not found",
      });
    }

    await unFollowSubreddits(username, subreddit);

    return res.status(200).json({
      status: "success",
      message: "Subreddit unfollowed successfully",
    });
  } catch (error) {
    console.error("Error unfollowing subreddit:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

/**
 * follow a subreddit
 * @param {String} (username)
 * @param {String} (communityName)
 * @function
 */
async function followSubreddit(req, res) {
  try {
    const { username, subreddit } = req.body;

    const userExists = await User.findOne({ username });
    if (!userExists) {
      return res.status(404).json({
        status: "failed",
        message: "Username not found",
      });
    }

    const subredditExists = await Community.findOne({ name: subreddit });
    if (!subredditExists) {
      return res.status(404).json({
        status: "failed",
        message: "Subreddit not found",
      });
    }

    await followSubreddits(username, subreddit);

    return res.status(200).json({
      status: "success",
      message: "Subreddit followed successfully",
    });
  } catch (error) {
    console.error("Error following subreddit:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

module.exports = {
  friendRequest,
  unFriendRequest,
  getUserInfo,
  followSubreddit,
  unFollowSubreddit,
  addUserToSubbreddit,
  followSubreddits,
  unFollowSubreddits,
  addFriend,
  deleteFriend,
};
