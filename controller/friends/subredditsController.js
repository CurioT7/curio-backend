const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const User = require("../../models/userModel");
const Community = require("../../models/subredditModel");
require("dotenv").config();
const { addUserToSubbreddit } = require("./friendController");
const { verifyToken } = require("../../utils/tokens");
const Notification = require("../../models/notificationModel");
const { getFilesFromS3 } = require("../../utils/s3-bucket");
const Invitation = require("../../models/invitationModel");
const Report = require("../../models/reportModel");

/**
 * Check whether subreddit is available or not
 * @param {string} subreddit
 * @returns {object} {state and subreddit}
 * @function
 */
async function availableSubreddit(subreddit) {
  try {
    const subReddit = await Community.findOne({ name: subreddit });
    if (subReddit) {
      return {
        success: false,
        subreddit: subReddit,
      };
    } else {
      return {
        success: true,
        subreddit: null,
      };
    }
  } catch (error) {
    console.error("Error checking subreddit availability:", error);
    return {
      success: false,
      subreddit: null,
      error: "An error occurred while checking subreddit availability",
    };
  }
}
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
  // If the subreddit name is not available (state is false), return an error response
  const subredditAvailable = await availableSubreddit(subredditName);
  //if subreddit is not available
  if (!subredditAvailable.success) {
    return {
      success: false,
      error: "Subreddit name is not available",
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
    privacyMode: data.privacyMode,
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
    // Notify the user about subreddit creation
    const notification = new Notification({
      title: "Subreddit Created",
      message: `You have successfully created the subreddit "${subredditName}".`,
      recipient: username,
      subredditName: subredditName,
      type: "subreddit",
    });
    await notification.save();

    // Return success response
    return {
      success: true,
      response: "Subreddit created successfully",
      communityName: subredditName,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
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
async function newSubreddit(req, res) {
  try {
    const user = await await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const result = await createSubreddit(req.body, user);
    console.log("adad");
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error,
      });
    }
    await addUserToSubbreddit(user, result.communityName);

    return res.status(201).json({
      success: true,
      message: result.response,
      communityName: result.communityName,
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
 * Get information about a subreddit by name.
 * @async
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @returns {Promise<void>} A promise that resolves once the response is sent.
 */
async function getSubredditInfo(req, res) {
  const subredditName = decodeURIComponent(req.params.subreddit);

  try {
    // Query the database for the subreddit by name
    const subreddit = await Community.findOne({ name: subredditName });

    if (!subreddit) {
      return res
        .status(404)
        .json({ success: false, message: "Subreddit not found" });
    }
    let media = {};
    if (subreddit.media) {
      media = await getFilesFromS3(subreddit.media);
    }
    return res.status(200).json({
      success: true,
      subreddit: { ...subreddit.toObject(), media: media },
    });
  } catch (error) {
    console.error("Error fetching subreddit:", error);
    return res
      .status(500)
      .json({ success: false, error: "Failed to fetch subreddit" });
  }
}

/**
 * Retrieves the top communities sorted by the number of members.
 * @param {import('express').Request} req - The request object.
 * @param {import('express').Response} res - The response object.
 * @returns {Promise<void>} - Promise that resolves once the operation is complete.
 */
async function getTopCommunities(req, res) {
  const page = parseInt(req.query.page) || 1; // Default to page 1 if not provided
  const limit = 10; // Allow 10 items per page
  const sortBy = "members"; // Default sorting by members

  try {
    const skip = (page - 1) * limit;
    const totalCommunitiesCount = await Community.countDocuments();
    const communities = await Community.aggregate([
      {
        $project: {
          name: 1,
          category: 1,
          members: { $size: "$members" }, // Count the number of members for each community
        },
      },
      { $sort: { [sortBy]: -1 } },
      { $skip: skip },
      { $limit: limit },
    ]);

    res.status(200).json({ success: true, totalCommunitiesCount, communities });
  } catch (error) {
    console.error("Error fetching communities:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
  }
}
/**
 * Create a new moderation for a subreddit.
 * @async
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @returns {Promise<void>} A promise that resolves once the response is sent.
 * @function
 * @name createModeration
 * @returns {object} response
 
 */
async function createModeration(req, res) {
  try {
    const decodedURI = decodeURIComponent(req.params.subreddit);
    const subreddit = await Community.findOne({ name: decodedURI });
    const moderationName = req.body.moderationName;
    const role = req.body.role;
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!subreddit) {
      return res.status(404).json({
        success: false,
        message: "Subreddit not found",
      });
    }

    if (!role) {
      return res.status(400).json({
        success: false,
        message: "Role not provided",
      });
    }

    // Check if the user is the creator of the subreddit
    const isCreator = subreddit.moderators.some(
      (mod) => mod.username === user.username && mod.role === "creator"
    );

    if (!isCreator) {
      return res.status(403).json({
        success: false,
        message: "Only the creator of the subreddit can add moderators",
      });
    }

    // Check if the user to be added as moderator exists
    const moderatorUser = await User.findOne({ username: moderationName });
    if (!moderatorUser) {
      return res.status(404).json({
        success: false,
        message: "User to be added as moderator not found",
      });
    }

    // Check if the user is already a moderator of the subreddit
    const isAlreadyModerator = subreddit.moderators.some(
      (mod) => mod.username === moderationName
    );
    if (isAlreadyModerator) {
      return res.status(400).json({
        success: false,
        message: "User is already a moderator of the subreddit",
      });
    }

    // Check if the user is a member of the subreddit
    const isMember = subreddit.members.some(
      (member) => member.username === moderationName
    );
    if (!isMember) {
      return res.status(400).json({
        success: false,
        message: "User is not a member of the subreddit",
      });
    }

    // Send an invitation to the user to become a moderator
    const invitation = new Invitation({
      sender: user.username,
      recipient: moderationName,
      subreddit: subreddit.name,
      role: role,
    });
    await invitation.save();

  
    return res.status(200).json({
      success: true,
      message: "Moderator invitation sent successfully",
      invitationId: invitation._id,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
}

async function acceptInvitation(req, res) {
  try {
    const invitationId = req.body.invitationId;
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const invitation = await Invitation.findById(invitationId);

    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: "Invitation not found",
      });
    }

    // Ensure the invitation is for the current user
    if (invitation.recipient !== user.username) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to accept this invitation",
      });
    }

    // Add the user as a moderator to the subreddit
    const subreddit = await Community.findOne({ name: invitation.subreddit });
    subreddit.moderators.push({
      username: user.username,
      role: invitation.role,
    });
    await subreddit.save();

    // Update the user's moderator role for the subreddit
    await User.findOneAndUpdate(
      { username: user.username },
      {
        $addToSet: {
          moderators: {
            subreddit: subreddit.name,
            role: invitation.role,
          },
          subreddits: {
            subreddit: subreddit.name,
            role: invitation.role,
          },
        },
      }
    );

    // Delete the invitation
    await Invitation.findByIdAndDelete(invitationId);
    const disabledSubreddit =
      user.notificationSettings.disabledSubreddits.includes(
        subreddit.name
      );
    console.log(disabledSubreddit);
    console.log(user.notificationSettings.disabledSubreddits);
    // Create a notification for the moderator with isDisabled set based on whether notifications are disabled
    const notification = new Notification({
      title: disabledSubreddit ? "Moderation (Disabled)" : "Moderation",
      message: `${user.username} made you a moderator for "${
        subreddit.name
      }". ${
        disabledSubreddit ? "Notifications are disabled for the subreddit." : ""
      }`,
      recipient: user.username,
      subreddits: subreddit.name,
      type: "subreddit",
      isDisabled: disabledSubreddit,
    });

    // Save the notification to the database
    await notification.save();

    // Save the notification to the database
    await notification.save();

    return res.status(200).json({
      success: true,
      message: "Invitation accepted successfully",
      subreddit: subreddit.name,
      role: invitation.role,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
}

async function removeModeration(req, res) {
  try {
    const user = await User.findById(req.user.userId);
    const decodedURI = decodeURIComponent(req.params.subreddit);
    const subreddit = await Community.findOne({ name: decodedURI });
    const moderationName = req.body.moderationName;
    const role = req.body.role;
    if (!user)
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    if (!subreddit)
      return res.status(404).json({
        success: false,
        message: "Subreddit not found",
      });
    if (!role)
      return res.status(400).json({
        success: false,
        message: "Role not provided",
      });
    const isCreator = subreddit.moderators.some(
      (mod) => mod.username === user.username && mod.role === "creator"
    );
    if (!isCreator)
      return res.status(403).json({
        success: false,
        message: "Only the creator of the subreddit can remove moderators",
      });
    const moderatorUser = await User.findOne({ username: moderationName });
    if (!moderatorUser)
      return res.status(404).json({
        success: false,
        message: "User to be removed as moderator not found",
      });
    const isModerator = subreddit.moderators.some(
      (mod) => mod.username === moderationName
    );
    if (!isModerator)
      return res.status(400).json({
        success: false,
        message: "User is not a moderator of the subreddit",
      });
    if (role === "creator")
      return res.status(400).json({
        success: false,
        message: "Cannot remove creator role",
      });
    subreddit.moderators = subreddit.moderators.filter(
      (mod) => mod.username !== moderationName
    );
    await subreddit.save();
    await User.findOneAndUpdate(
      { username: moderationName },
      {
        $pull: {
          moderators: {
            subreddit: subreddit.name,
          },
          subreddits: {
            subreddit: subreddit.name,
            role: role,
          },
          $push: {
            subreddits: {
              subreddit: subreddit.name,
              role: "member",
            },
          },
        },
      }
    );
    return res.status(200).json({
      success: true,
      message: "Moderator removed successfully",
      moderator: { username: moderationName },
    });
  } catch {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
}async function getModerators(req, res) {
  try {
    const decodedURL = decodeURIComponent(req.params.subreddit); 
    const subreddit = await Community.findOne({ name: decodedURL });
    if (!subreddit) {
      return res.status(404).json({
        success: false,
        message: "Subreddit is not found",
      });
    }
    const moderators = subreddit.moderators;
    return res.status(200).json({
      success: true,
      moderators: moderators,
    });
  } catch (error) {
    console.error(error); 
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

async function getModeratorsQueue(req, res) {
  try {
    const user = await User.findById(req.user.userId);
    const decodedURI = decodeURIComponent(req.params.subreddit);
    const subreddit = await Community.findOne({ name: decodedURI });
    if (!user)
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    if (!subreddit)
      return res.status(404).json({
        success: false,
        message: "Subreddit not found",
      });
    const isCreator = subreddit.moderators.some(
      (mod) => mod.username === user.username && mod.role === "creator"
    );
    const isModerator = subreddit.moderators.some(
      (mod)=>mod.username==user.username &&mod.role=="moderator"
    )
    if (!isCreator || !isModerator)
      return res.status(403).json({
        success: false,
        message: "Only the creator or moderator of the subreddit can view the queue",
      });
    const reports = await Report.find({ linkedSubreddit: subreddit.name });
    return res.status(200).json({
      success: true,
      reports: reports,
    });

  } catch (error)
  {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
}

async function declineInvitation(req, res) {
  try {
    const invitationId = req.body.invitationId;
    const user = await User.findById(req.user.userId);
    if (!user)
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    const invitation = await Invitation.findById(invitationId);
    if (!invitation)
      return res.status(404).json({
        success: false,
        message: "Invitation not found",
      });
    if (invitation.recipient !== user.username)
      return res.status(403).json({
        success: false,
        message: "You are not authorized to decline this invitation",
      });
    await Invitation.findByIdAndDelete(invitationId);
    const moderator=await User.findOne({username:invitation.sender})
    const disabledSubreddit =
      moderator.notificationSettings.disabledSubreddits.includes(
        invitation.subreddit
      );
    console.log(disabledSubreddit);
    console.log(moderator.notificationSettings.disabledSubreddits);
    const notification = new Notification({
      title: disabledSubreddit ? "Moderation (Disabled)" : "Moderation",
      message: `${user.username} declined your invitation to moderate "${invitation.subreddit}". ${
        disabledSubreddit ? "Notifications are disabled for the subreddit." : ""
      }`,
      recipient: invitation.sender,
      subredditName: invitation.subreddit,
      type: "subreddit",
      isDisabled: disabledSubreddit,
    });
    await notification.save();

    return res.status(200).json({
      success: true,
      message: "Invitation declined successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
}

async function muteUser(req, res) {
  try {
    const user = await User.findById(req.user.userId);
    const decodedURI = decodeURIComponent(req.params.subreddit);
    const subreddit = await Community.findOne({ name: decodedURI });
    const mutedUser = req.body.mutedUser;
    if (!user)
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    if (!subreddit)
      return res.status(404).json({
        success: false,
        message: "Subreddit not found",
      });
    const isModerator = subreddit.moderators.some(
      (mod) => mod.username === user.username
    );
    if (!isModerator)
      return res.status(403).json({
        success: false,
        message: "Only moderators can mute users",
      });
    const muted = subreddit.mutedUsers.some(
      (muted) => muted.username === mutedUser
    );
    
    if (subreddit.moderators.some((mod) => mod.username === mutedUser)) {
      return res.status(400).json({
        success: false,
        message: "Cannot mute moderators",
      });
    }

    if (muted)
      return res.status(400).json({
        success: false,
        message: "User is already muted",
      });
    
    const mutedUserSettings = await User.findOne({ username: mutedUser });
     const disabledSubreddit =
       mutedUserSettings &&
       mutedUserSettings.notificationSettings.disabledSubreddits.includes(
         subreddit.name
       );

     const notification = new Notification({
       title: disabledSubreddit ? "Muted (Disabled)" : "Muted",
       message: `${user.username} muted you in "${subreddit.name}". ${
         disabledSubreddit
           ? "Notifications are disabled for the subreddit."
           : ""
       }`,
       recipient: mutedUser,
       subredditName: subreddit.name,
       type: "subreddit",
       isDisabled: disabledSubreddit,
     });
     await notification.save();
    
    subreddit.mutedUsers.push({ username: mutedUser });
    await subreddit.save();
    return res.status(200).json({
      success: true,
      message: "User muted successfully",
      mutedUser: mutedUser,
    });
   
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }

}

async function unMuteUser(req, res) {
  try {
    const user = await User.findById(req.user.userId);
    const decodedURI = decodeURIComponent(req.params.subreddit);
    const subreddit = await Community.findOne({ name: decodedURI });
    const mutedUser = req.body.mutedUser;
    if (!user)
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    if (!subreddit
    )
      return res.status(404).json({
        success: false,
        message: "Subreddit not found",
      });
    const isModerator = subreddit.moderators.some(
      (mod) => mod.username === user.username
    );
    if (!isModerator)
      return res.status(403).json({
        success: false,
        message: "Only moderators can unmute users",
      });
    const muted = subreddit.mutedUsers.some(
      (muted) => muted.username === mutedUser
    );
    if (!muted)
      return res.status(400).json({
        success: false,
        message: "User is not muted",
      });
    subreddit.mutedUsers = subreddit.mutedUsers.filter(
      (muted) => muted.username !== mutedUser
    );
    await subreddit.save();
    return res.status(200).json({
      success: true,
      message: "User unmuted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
}

async function leaveModerator(req, res) {
  try {
    const user = await User.findById(req.user.userId);
    const decodedURI = decodeURIComponent(req.params.subreddit);
    const subreddit = await Community.findOne({ name: decodedURI });
    if (!user)
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    if (!subreddit)
      return res.status(404).json({
        success: false,
        message: "Subreddit not found",
      });
    const isModerator = subreddit.moderators.some(
      (mod) => mod.username === user.username
    );
    if (!isModerator)
      return res.status(403).json({
        success: false,
        message: "Only moderators can leave moderation",
      });
    subreddit.moderators = subreddit.moderators.filter(
      (mod) => mod.username !== user.username
    );
    await subreddit.save();
    await User.findOneAndUpdate(
      { username: user.username },
      {
        $pull: {
          moderators: {
            subreddit: subreddit.name,
          },
          subreddits: {
            subreddit: subreddit.name,
            role: role,
          },
          $push: {
            subreddits: {
              subreddit: subreddit.name,
              role: "member",
            },
          },
        },
      }
    );
    const disabledSubreddit = user.notificationSettings.disabledSubreddits.includes(subreddit.name);
    console.log(disabledSubreddit);
    console.log(user.notificationSettings.disabledSubreddits);
    const notification = new Notification({
      title: disabledSubreddit ? "Moderation (Disabled)" : "Moderation",
      message: `${user.username} left moderation for "${subreddit.name}". ${
        disabledSubreddit ? "Notifications are disabled for the subreddit." : ""
      }`,
      recipient: subreddit.creator,
      subredditName: subreddit.name,
      type: "subreddit",
      isDisabled: disabledSubreddit,
    });
    await notification.save();
    return res.status(200).json({
      success: true,
      message: "Moderator left successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
}

module.exports = {
  newSubreddit,
  availableSubreddit,
  createSubreddit,
  getSubredditInfo,
  getTopCommunities,
  createModeration,
  removeModeration,
  acceptInvitation,
  getModerators,
  getModeratorsQueue,
  declineInvitation,
  muteUser,
  unMuteUser,
  leaveModerator,
};
