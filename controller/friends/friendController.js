const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const User = require("../../models/userModel");
const Community = require("../../models/subredditModel");
const brypt = require("bcrypt");
const { verifyToken } = require("../../utils/tokens");
const Notification = require("../../models/notificationModel");
const { getFilesFromS3 } = require("../../utils/s3-bucket");

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
async function addFriend(username, friendUsername) {
  try {
    // Update the user's followings list
    await User.findOneAndUpdate(
      { username: username },
      {
        $addToSet: {
          followings: friendUsername,
        },
      }
    );

    // Update the friend's followers list
    await User.findOneAndUpdate(
      { username: friendUsername },
      {
        $addToSet: {
          followers: username,
        },
      }
    );
     

    return {
      status: true,
      message: "Friend added successfully",
    };
  } catch (error) {
    console.error("Error adding friend:", error);
    return {
      status: false,
      error: "Failed to add friend",
    };
  }
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
  const moderator = user.moderators;
  moderator.push(userModerator);
  const members = user.member;
  members.push(userMember);
  console.log("success");
  try {
    await user.findOneAndUpdate(
      { username: user.username },
      { moderators: moderator, member: members }
    );
  } catch {
    return {
      status: false,
      error: "operation user",
    };
  }
}

/**
 * friend request to add friendship or moderator_deInvite
 * @param {function} (req,res)
 * @returns {object} res
 */
async function friendRequest(req, res) {
  const friendname = req.body.friendUsername;

  try {
    const user = await User.findById(req.user.userId);

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

    // Check if the user is already following the friend
    const isFollowing = user.followings.includes(friendname);
    if (isFollowing) {
      return res.status(400).json({
        status: false,
        message: "You are already following this user",
      });
    }

    await addFriend(user.username, friendname);
 const disabledSubreddit =
   user.notificationSettings.disabledSubreddits.includes(user.subreddit);
 if (disabledSubreddit) {
   // Create a notification for the friend with isDisabled set to true
   const notification = new Notification({
     title: "New Follower (Disabled)",
     message: `${user.username} started following you. Notifications are disabled for the subreddit "${friendname.subreddit}".`,
     recipient: friendname,
     type: "Friend Request",
     isDisabled: true,
   });

   // Save the notification to the database
   await notification.save();
 }
 // Create a notification for the friend
 const notification = new Notification({
   title: "New Follower",
   message: `${user.username} started following you.`,
   recipient: friendname,
   type: "Friend Request",
 });

 // Save the notification to the database
 await notification.save();
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
  const friendname = req.body.friendUsername;

  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        status: "failed",
        message: "User not found",
      });
    }

    // Check if the user is following the friend
    const isFollowing = user.followings.includes(friendname);
    if (!isFollowing) {
      return res.status(400).json({
        status: false,
        message: "You are not following this user",
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
  const { friendUsername } = req.params; // Extract friend's username from request parameters
  let media = {};
  if (friendUsername.media) {
    media = await getFilesFromS3(friendUsername.media);
  }
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if the friend exists in the user's friend list
    const friend = await User.findOne({ username: friendUsername });
    if (!friend || !user.followings.includes(friendUsername)) {
      return res.status(404).json({
        success: false,
        message: "Friend not found",
      });
    }

    // Return information about the friend
    return res.status(200).json({
      username: friend.username,
      bio: friend.bio,
      profilePicture: friend.profilePicture,
      media: media,
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
 * unfollow a subreddit
 * @param {String} (username)
 * @param {String} (communityName)
 * @function
 */

async function unFollowSubreddit(req, res) {
  try {
    const { subreddit } = req.body;

    const userExists = await User.findById(req.user.userId);

    if (!userExists) {
      return res.status(404).json({
        success: false,
        message: "Username not found",
      });
    }

    const subredditExists = await Community.findOne({ name: subreddit });
    if (!subredditExists) {
      return res.status(404).json({
        success: false,
        message: "Subreddit not found",
      });
    }

    // Check if the user is a member of the subreddit
    const isMember = subredditExists.members.some(
      (member) => member.username === userExists.username
    );
    if (!isMember) {
      return res.status(400).json({
        success: false,
        message: "You are not a member of this subreddit",
      });
    }

    await unFollowSubreddits(userExists.username, subreddit);

    return res.status(200).json({
      success: true,
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
    const { subreddit } = req.body;
    const userId = req.user.userId;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const subredditExists = await Community.findOne({ name: subreddit });
    if (!subredditExists) {
      return res.status(404).json({
        success: false,
        message: "Subreddit not found",
      });
    }

    const isMember = subredditExists.members.some(
      (member) => member.username === user.username
    );
    if (isMember) {
      return res.status(400).json({
        success: false,
        message: "You are already a member of this subreddit",
      });
    }

    // Check if notifications are disabled for the subreddit
    const isDisabledSubreddit =
      user.notificationSettings.disabledSubreddits.includes(subreddit);

    if (isDisabledSubreddit) {
      // Create a notification for the user with isDisabled set to true
      const userNotification = new Notification({
        title: "Subreddit Followed (Disabled)",
        message: `You have followed the subreddit "${subreddit}", but notifications are disabled for this subreddit.`,
        recipient: user.username,
        type: "Subreddit Followed",
        subredditName: subreddit,
        isDisabled: true,
      });
      await userNotification.save();
    }

    await followSubreddits(user.username, subreddit);

    // Notify the moderators of the subreddit
    const moderators = subredditExists.moderators.map(
      (moderator) => moderator.username
    );
    for (const moderator of moderators) {
      const moderatorUser = await User.findOne({ username: moderator });
      if (!moderatorUser) {
        // Handle case where moderator user is not found
        continue; // Skip to the next iteration
      }

      const isModeratorDisabledSubreddit =
        moderatorUser.notificationSettings.disabledSubreddits.includes(
          subreddit
        );

      const notification = new Notification({
        title: isModeratorDisabledSubreddit
          ? "Subreddit Followed (Disabled)"
          : "New Follower",
        message: isModeratorDisabledSubreddit
          ? `You have followed the subreddit "${subreddit}", but notifications are disabled for this subreddit.`
          : `${user.username} started following the subreddit "${subreddit}".`,
        recipient: moderator,
        type: "Subreddit Follower",
        subredditName: subreddit,
        isDisabled: isModeratorDisabledSubreddit,
      });
      await notification.save();
    }

    // Create a notification for the user if notifications are not disabled for the subreddit
    if (!isDisabledSubreddit) {
      const userNotification = new Notification({
        title: "Subreddit Followed",
        message: `You have successfully followed the subreddit "${subreddit}".`,
        recipient: user.username,
        type: "Subreddit Followed",
        subredditName: subreddit,
      });
      await userNotification.save();
    }

    return res.status(200).json({
      success: true,
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



/**
 * Retrieves followers or followings of a user along with their profile pictures.
 * @param {object} req - The request object containing user information.
 * @param {object} res - The response object for sending HTTP responses.
 * @returns {object} An object containing information about followers or followings along with their profile pictures.
 * @throws {Error} If there's an error in retrieving followers or followings.
 */
async function getFollowersOrFollowings(req, res) {
  try {
    if (req.user) {
      const userId = req.user.userId;
      const friends = req.params.friends;
      let friendsArray;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      if (friends === "followers") {
        friendsArray = user.followers;
      } else if (friends === "followings") {
        friendsArray = user.followings;
      } else {
        return res.status(400).json({
          success: false,
          message: "Wrong query parameter",
        });
      }

      // Perform a customized query to retrieve followers/followings along with profile pictures
      const usersWithProfilePictures = await User.aggregate([
        {
          $match: { username: { $in: friendsArray } },
        },
        {
          $project: { username: 1, profilePicture: 1 },
        },
      ]);

      return res.status(200).json({
        success: true,
        friendsArray: usersWithProfilePictures,
      });
    }
  } catch (error) {
    console.error("Error getting followers or followings:", error);
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
  getFollowersOrFollowings,
};
