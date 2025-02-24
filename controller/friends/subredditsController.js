const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const User = require("../../models/userModel");
const Community = require("../../models/subredditModel");
const ban = require("../../models/banModel");
require("dotenv").config();
const { addUserToSubbreddit } = require("./friendController");
const { verifyToken } = require("../../utils/tokens");
const Notification = require("../../models/notificationModel");
const { getFilesFromS3 } = require("../../utils/s3-bucket");
const Invitation = require("../../models/invitationModel");
const Report = require("../../models/reportModel");
const Post = require("../../models/postModel");
const Comment = require("../../models/commentModel");
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
    const user = await User.findById(req.user.userId);

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
    res.status(500).json({
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
      manageUsers: req.body.manageUsers,
      createLiveChats: req.body.createLiveChats,
      manageSettings: req.body.manageSettings,
      managePostsAndComments: req.body.managePostsAndComments,
      everything: req.body.everything,
    });
    await invitation.save();

    const moderationid = await User.findOne({ username: moderationName });
    const disabledSubreddit =
      moderationid.notificationSettings.disabledSubreddits.includes(
        subreddit.name
      );

    console.log(disabledSubreddit);
    console.log(moderationid.notificationSettings.disabledSubreddits);
    // Create a notification for the moderator with isDisabled set based on whether notifications are disabled
    const notification = new Notification({
      title: disabledSubreddit ? "Moderation (Disabled)" : "Moderation",
      message: `${user.username} invited youto be a moderator for "${
        subreddit.name
      }". ${
        disabledSubreddit ? "Notifications are disabled for the subreddit." : ""
      }`,
      recipient: moderationid.username,
      subredditName: subreddit.name,
      invitiations: invitation._id,
      type: "invite",
      isDisabled: disabledSubreddit,
    });
    await notification.save();

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

/**
 * Accept an invitation to moderate a subreddit.
 * @async
 * @function acceptInvitation
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @returns {Promise<void>} A promise that resolves once the invitation is accepted.
 * @throws {Error} If an error occurs while accepting the invitation.
 */
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
      manageUsers: invitation.manageUsers,
      createLiveChats: invitation.createLiveChats,
      manageSettings: invitation.manageSettings,
      managePostsAndComments: invitation.managePostsAndComments,
      everything: invitation.everything,
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
            manageUsers: invitation.manageUsers,
            createLiveChats: invitation.createLiveChats,
            manageSettings: invitation.manageSettings,
            managePostsAndComments: invitation.managePostsAndComments,
            everything: invitation.everything,
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
      user.notificationSettings.disabledSubreddits.includes(subreddit.name);
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
      subredditName: subreddit.name,
      invitiations: invitationId,
      type: "subreddit",
      isDisabled: disabledSubreddit,
    });

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

/**
 *  Remove a moderation from a subreddit.
 * @async
 * @function removeModeration
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @returns {Promise<void>} A promise that resolves once the moderation is removed.
 * @throws {Error} If an error occurs while removing the moderation.
 */
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
      // error: error.message,
    });
  }

  /**
   * Get the list of moderators for a subreddit.
   * @async
   * @function getModerators
   * @param {Object} req - The HTTP request object.
   * @param {Object} res - The HTTP response object.
   * @returns {Promise<void>} A promise that resolves once the moderators are retrieved.
   * @throws {Error} If an error occurs while fetching the moderators.
   */
}
async function getModerators(req, res) {
  try {
    const decodedURL = decodeURIComponent(req.params.subreddit);
    const subreddit = await Community.findOne({ name: decodedURL });
    if (!subreddit) {
      return res.status(404).json({
        success: false,
        message: "Subreddit not found",
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

/**
 * get moderators queue
 * @async
 * @function getModeratorsQueue
 *  @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @returns {Promise<void>} A promise that resolves once the queue is retrieved.
 * @throws {Error} If an error occurs while fetching the queue.
 */
async function getModeratorsQueue(req, res) {
  try {
    const user = await User.findById(req.user.userId);
    const decodedURI = decodeURIComponent(req.params.subreddit);
    const subreddit = await Community.findOne({ name: decodedURI });

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

    const isCreatorOrModerator = subreddit.moderators.some((mod) => {
      return (
        mod.username === user.username &&
        (mod.role === "creator" || mod.role === "moderator")
      );
    });

    if (!isCreatorOrModerator) {
      return res.status(403).json({
        success: false,
        message:
          "Only the creator or moderator of the subreddit can view the queue",
      });
    }

    const reports = await Report.find({ linkedSubreddit: subreddit.id });
    console.log("subreddit.name:", subreddit.id);
    console.log("reports:", reports);

    return res.status(200).json({
      success: true,
      reports: reports,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
}

/**
 * Decline an invitation to moderate a subreddit.
 * @async
 * @function declineInvitation
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @returns {Promise<void>} A promise that resolves once the invitation is declined.
 * @throws {Error} If an error occurs while declining the invitation.
 */
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
    const moderator = await User.findOne({ username: invitation.sender });
    const disabledSubreddit =
      moderator.notificationSettings.disabledSubreddits.includes(
        invitation.subreddit
      );
    console.log(disabledSubreddit);
    console.log(moderator.notificationSettings.disabledSubreddits);
    const notification = new Notification({
      title: disabledSubreddit ? "Moderation (Disabled)" : "Moderation",
      message: `${user.username} declined your invitation to moderate "${
        invitation.subreddit
      }". ${
        disabledSubreddit ? "Notifications are disabled for the subreddit." : ""
      }`,
      recipient: invitation.sender,
      subredditName: invitation.subreddit,
      invitiations: invitationId,
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
/**
 * Mute a user in a subreddit.
 * @async
 * @function muteUser
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @returns {Promise<void>} A promise that resolves once the user is muted.
 * @throws {Error} If an error occurs while muting the user.
 * @returns {object} response
 */
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
        disabledSubreddit ? "Notifications are disabled for the subreddit." : ""
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
/**
 * Unmute a user in a subreddit.
 * @async
 * @function unMuteUser
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @returns {Promise<void>} A promise that resolves once the user is unmuted.
 * @throws {Error} If an error occurs while unmuting the user.
 */
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
    const mutedUserSettings = await User.findOne({ username: mutedUser });
    const disabledSubreddit =
      mutedUserSettings &&
      mutedUserSettings.notificationSettings.disabledSubreddits.includes(
        subreddit.name
      );

    const notification = new Notification({
      title: disabledSubreddit ? "Un-Muted (Disabled)" : "Un-Muted",
      message: `${user.username} unmuted you in "${subreddit.name}". ${
        disabledSubreddit ? "Notifications are disabled for the subreddit." : ""
      }`,
      recipient: mutedUser,
      subredditName: subreddit.name,
      type: "subreddit",
      isDisabled: disabledSubreddit,
    });
    await notification.save();
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
/**
 * Leave moderation for a subreddit.
 * @async
 * @function leaveModerator
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @returns {Promise<void>} A promise that resolves once the user leaves moderation.
 * @throws {Error} If an error occurs while leaving moderation.
 */
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
            role: "moderator",
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
/**
 * Get the list of muted users for a subreddit.
 * @async
 * @function getUserMuted
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @returns {Promise<void>} A promise that resolves once the list of muted users is retrieved.
 * @throws {Error} If an error occurs while fetching the muted users.
 */
async function getMineModeration(req, res) {
  try {
    const user = await User.findById(req.user.userId);
    if (!user)
      return res.status(404).json({
        success: false,
        message: "User not found",
      });

    const isModerator = await Community.find({
      moderators: { $elemMatch: { username: user.username } },
    });
    const subredditsWithPermissions = isModerator.map((subreddit) => {
      const moderatorInfo = subreddit.moderators.find(
        (moderator) => moderator.username === user.username
      );

      return {
        name: subreddit.name,
        role: moderatorInfo.role,
        permissions: {
          manageUsers: moderatorInfo
            ? moderatorInfo.manageUsers || false
            : false,
          createLiveChats: moderatorInfo
            ? moderatorInfo.createLiveChats || false
            : false,
          manageSettings: moderatorInfo
            ? moderatorInfo.manageSettings || false
            : false,
          managePostsAndComments: moderatorInfo
            ? moderatorInfo.managePostsAndComments || false
            : false,
          everything: moderatorInfo ? moderatorInfo.everything || false : false,
        },
      };
    });

    return res.status(200).json({
      success: true,
      subreddits: subredditsWithPermissions,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
}
/**
 * Get the list of muted users for a subreddit.
 * @async
 * @function getUserMuted
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @returns {Promise<void>} A promise that resolves once the list of muted users is retrieved.
 * @throws {Error} If an error occurs while fetching the muted users.
 */
async function getUserMuted(req, res) {
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
        message: "Only moderators can view muted users",
      });
    const mutedUsers = subreddit.mutedUsers;
    return res.status(200).json({
      success: true,
      mutedUsers: mutedUsers,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
}
/**
 * Get the list of moderators for a subreddit.
 * @async
 * @function getSubredditModerator
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @returns {Promise<void>} A promise that resolves once the list of moderators is retrieved.
 * @throws {Error} If an error occurs while fetching the moderators.
 * @returns {Object} Response object
 */
async function getSubredditModerator(req, res) {
  try {
    const decodedURI = decodeURIComponent(req.params.subreddit);
    const subreddit = await Community.findOne({ name: decodedURI });
    if (!subreddit) {
      return res.status(404).json({
        success: false,
        message: "Subreddit not found",
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

/**
 * Get unmoderated posts and comments in a subreddit.
 * @async
 * @function getUnmoderated
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @returns {Promise<void>} A promise that resolves once the unmoderated posts and comments are retrieved.
 * @throws {Error} If an error occurs during the process.
 * @returns {Object} Response object
 */
async function getUnmoderated(req, res) {
  try {
    const user = await User.findById(req.user.userId);
    const decodedURI = decodeURIComponent(req.params.subreddit);
    const subreddit = await Community.findOne({ name: decodedURI });
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
    const isModerator = subreddit.moderators.some(
      (mod) => mod.username === user.username
    );
    if (!isModerator) {
      return res.status(403).json({
        success: false,
        message: "Only moderators can view the unmoderated queue",
      });
    }

    const unmoderatedPosts = await Post.find({
      _id: { $in: subreddit.posts },
      isApprovedForShare: false,
    });
    console.log("subreddit.posts:", subreddit.posts);
    console.log("unmoderatedPosts:", unmoderatedPosts);

    return res.status(200).json({
      success: true,
      unmoderatedPosts: unmoderatedPosts,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}
/**
 * Edit permissions for a moderator in a subreddit.
 * @async
 * @function editPermissions
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @returns {Promise<void>} A promise that resolves once the permissions are updated.
 * @throws {Error} If an error occurs during the process.
 * @returns {Object} Response object
 */
async function editPermissions(req, res) {
  try {
    const user = await User.findById(req.user.userId);
    const decodedURI = decodeURIComponent(req.params.subreddit);
    const subreddit = await Community.findOne({ name: decodedURI });

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
    const isCreator = subreddit.moderators.some(
      (mod) => mod.username === user.username && mod.role === "creator"
    );
    if (!isCreator) {
      return res.status(403).json({
        success: false,
        message: "Only the creator of the subreddit can edit permissions",
      });
    }
    const {
      moderationName,
      manageUsers,
      createLiveChats,
      manageSettings,
      managePostsAndComments,
      everything,
    } = req.body;
    const moderator = subreddit.moderators.find(
      (mod) => mod.username === moderationName
    );
    if (!moderator) {
      return res.status(404).json({
        success: false,
        message: "Moderator not found",
      });
    }
    moderator.manageUsers = manageUsers;
    moderator.createLiveChats = createLiveChats;
    moderator.manageSettings = manageSettings;
    moderator.managePostsAndComments = managePostsAndComments;
    moderator.everything = everything;
    await subreddit.save();
    return res.status(200).json({
      success: true,
      message: "Permissions updated successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

/**
 * Bans a user from a subreddit.
 * @async
 * @function banUser
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @returns {Promise<void>} A promise that resolves once the user is banned.
 * @throws {Error} If an error occurs during the ban process.
 */
async function banUser(req, res) {
  try {
    if (req.user) {
      const user = await User.findOne({ _id: req.user.userId });

      const { subredditName, violation, modNote, userMessage, userToBan } =
        req.body;

      // Validate input parameters
      if (!subredditName || !violation || !userToBan) {
        return res.status(400).json({ message: "Missing required parameters" });
      }

      // Find the user to be banned
      const bannedUser = await User.findOne({ username: userToBan });
      if (!bannedUser) {
        return res.status(404).json({ message: "User to ban not found" });
      }

      const isModerator = user.moderators.some(
        (moderator) => moderator.subreddit === subredditName
      );
      if (!isModerator) {
        return res
          .status(403)
          .json({ message: "Forbidden, you must be a moderator!" });
      }

      const subreddit = await Community.findOne({ name: subredditName });
      if (!subreddit) {
        return res.status(404).json({ message: "Subreddit not found" });
      }

      // Check if the banned user is a member of the subreddit
      const isMember = subreddit.members.some(
        (member) => member.username === userToBan
      );
      if (!isMember) {
        return res
          .status(400)
          .json({ message: "User is not a member of the subreddit" });
      }

      // Check if the user is trying to ban themselves
      if (userToBan === user.username) {
        return res.status(400).json({ message: "You can't ban yourself" });
      }

      // Check if the user is already banned
      if (subreddit.bannedUsers.some((user) => user.username === userToBan)) {
        return res.status(400).json({ message: "User is already banned" });
      }

      // Add the banned username to the subreddit's bannedUsers array
      subreddit.bannedUsers.push({ username: userToBan });
      await subreddit.save();

      // Create a new ban entry
      const newBan = new ban({
        bannedUsername: userToBan,
        linkedSubreddit: subredditName,
        violation,
        modNote,
        userMessage,
        bannedBy: "moderator",
      });
      await newBan.save();

      return res.status(200).json({ message: "User banned successfully" });
    }
  } catch (error) {
    console.error("Error banning user:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

/**
 * Unban a user from a subreddit.
 *
 * @param {object} req - The request object.
 * @param {object} req.user - The user object from the request.
 * @param {string} req.user.userId - The ID of the user performing the unban action.
 * @param {object} req.body - The request body containing parameters.
 * @param {string} req.body.subredditName - The name of the subreddit from which to unban the user.
 * @param {string} req.body.bannedUser - The username of the user to unban.
 * @param {object} res - The response object.
 * @returns {object} - The response JSON object indicating success or failure.
 *
 * @typedef {object} User
 * @property {string} _id - The unique identifier of the user.
 * @property {Array} moderators - Array of subreddit moderator objects.
 *
 * @typedef {object} Community
 * @property {string} name - The name of the subreddit.
 * @property {Array} bannedUsers - Array of banned user objects.
 *
 * @typedef {object} ban
 * @property {string} bannedUsername - The username of the banned user.
 * @property {string} violation - The reason for the ban.
 * @property {string} modNote - Additional note from the moderator.
 * @property {string} userMessage - Message sent to the banned user.
 */
async function unbanUser(req, res) {
  try {
    if (req.user) {
      const user = await User.findOne({ _id: req.user.userId });

      const { subredditName, bannedUser } = req.body;

      // Validate input parameters
      if (!subredditName || !bannedUser) {
        return res.status(400).json({ message: "Missing required parameters" });
      }

      // Find the subreddit
      const subreddit = await Community.findOne({ name: subredditName });
      if (!subreddit) {
        return res.status(404).json({ message: "Subreddit not found" });
      }

      // Check if the user has moderator privileges
      const isModerator = user.moderators.some(
        (moderator) => moderator.subreddit === subredditName
      );
      if (!isModerator) {
        return res
          .status(403)
          .json({ message: "Forbidden, you must be a moderator!" });
      }

      // Check if the user to unban is in the banned users list
      const index = subreddit.bannedUsers.findIndex(
        (user) => user.username === bannedUser
      );
      if (index === -1) {
        return res.status(404).json({
          message: "User to unban not found in the banned users list",
        });
      }

      // Remove the user from the banned users list
      subreddit.bannedUsers.splice(index, 1);
      await subreddit.save();

      // Remove the ban entry from the ban schema
      await ban.deleteOne({ bannedUsername: bannedUser });

      return res.status(200).json({ message: "User unbanned successfully" });
    }
  } catch (error) {
    console.error("Error unbanning user:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

/**
 * Get the list of banned users in a subreddit.
 *
 * This function retrieves the list of banned users in a subreddit.
 *
 * @param {object} req - The request object.
 * @param {object} req.params - The URL parameters.
 * @param {string} req.params.subredditName - The name of the subreddit.
 * @param {object} res - The response object.
 * @returns {object} - The response JSON object containing the list of banned users.
 *
 * @throws {404} - Not Found if the subreddit is not found.
 * @throws {403} - Forbidden if the user does not have permission to view the banned users list.
 * @throws {500} - Internal Server Error if an unexpected error occurs.
 *
 * @memberof module:subredditsController
 * @inner
 */
async function getBannedUsers(req, res) {
  try {
    if (req.user) {
      const user = await User.findOne({ _id: req.user.userId });
      const { subredditName } = req.params;

      // Find the subreddit
      const subreddit = await Community.findOne({ name: subredditName });
      if (!subreddit) {
        return res.status(404).json({ message: "Subreddit not found" });
      }

      // Check if the user has moderator privileges
      const isModerator = user.moderators.some(
        (moderator) => moderator.subreddit === subredditName
      );
      if (!isModerator) {
        return res
          .status(403)
          .json({ message: "Forbidden, you must be a moderator!" });
      }

      const bannedUsers = [];

      const banDetails = await ban.find({ linkedSubreddit: subredditName });
      // Retrieve the list of banned users
      for (const bannedUser of subreddit.bannedUsers) {
        // Find user details by username
        const userDetails = await User.findOne({
          username: bannedUser.username,
        });
        if (userDetails.media) {
          userDetails.media = await getFilesFromS3(userDetails.media);
        }
        bannedUsers.push({
          banDetails: banDetails,
          userDetails: userDetails,
        });
      }

      return res.status(200).json({ bannedUsers });
    }
  } catch (error) {
    console.error("Error retrieving banned users:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

/**
 * Get the list of moderated communities by a user.
 *
 * This function retrieves the list of moderated communities by a user based on their username.
 *
 * @param {object} req - The request object.
 * @param {object} req.params - The URL parameters.
 * @param {string} req.params.username - The username of the user.
 * @param {object} res - The response object.
 * @returns {object} - The response JSON object containing the list of moderated communities.
 *
 * @throws {404} - Not Found if the user is not found.
 * @throws {500} - Internal Server Error if an unexpected error occurs.
 */
async function getModeratedCommunitiesByUsername(req, res) {
  try {
    const username = req.params.username;

    // Find the user by username
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Retrieve the list of moderated communities
    const moderatedCommunities = user.moderators.map(
      (moderator) => moderator.subreddit
    );

    return res.status(200).json({ moderatedCommunities });
  } catch (error) {
    console.error("Error retrieving moderated communities:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

/**
 * Approves or ignores a reported item based on moderator action.
 * @async
 * @function moderatorApprove
 * @param {Object} req - The request object.
 * @param {Object} req.user - The user object containing user information.
 * @param {string} req.user.userId - The ID of the user performing the action.
 * @param {Object} req.body - The request body containing item information.
 * @param {string} req.body.itemID - The ID of the item to approve or remove.
 * @param {string} req.body.itemType - The type of the item ('report' or 'post').
 * @param {string} req.body.subredditName - The name of the subreddit where the action is performed.
 * @param {Object} res - The response object.
 * @returns {Object} The response indicating success or failure.
 */
async function moderatorApprove(req, res) {
  try {
    if (req.user) {
      const user = await User.findOne({ _id: req.user.userId });
      const { itemID, itemType, subredditName } = req.body;

      // Check if the user has moderator privileges
      const isModerator = user.moderators.some(
        (moderator) => moderator.subreddit === subredditName
      );
      if (!isModerator) {
        return res
          .status(403)
          .json({ message: "Forbidden, you must be a moderator!" });
      }
      switch (itemType) {
        case "report":
          const report = await Report.findById(itemID).populate("linkedItem");
          if (!report) {
            return res
              .status(404)
              .json({ success: false, message: "Report not found" });
          }

          // Mark the report as ignored
          report.isIgnored = true;

          // Check if the linkedItem is a Post or Comment
          if (
            report.linkedItemType === "Post" ||
            report.linkedItemType === "Comment"
          ) {
            // Update the isReportApproved field of the linkedItem to true
            await report.linkedItem.updateOne({ isReportApproved: true });

            // Find all reports linked to the same item and mark them as ignored
            const allReports = await Report.find({
              linkedItem: report.linkedItem,
            });

            // Update all found reports to be ignored
            for (const document of allReports) {
              document.isIgnored = true;
              await document.save();
            }
          }
          // Save the changes to the report
          await report.save();
          break;

        case "post":
          const post = await Post.findById(itemID);
          if (!post) {
            return res
              .status(404)
              .json({ success: false, message: "Post not found" });
          }
          post.isApprovedForShare = true;
          await post.save();
          break;
      }
      return res.status(200).json({ message: "Item approved successfully" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

/**
 * Removes a reported or a post item based on moderator action.
 * @async
 * @function moderatorRemove
 * @param {Object} req - The request object.
 * @param {Object} req.user - The user object containing user information.
 * @param {string} req.user.userId - The ID of the user performing the action.
 * @param {Object} req.body - The request body containing item information.
 * @param {string} req.body.itemID - The ID of the item to remove.
 * @param {string} req.body.itemType - The type of the item ('report' or 'post').
 * @param {string} req.body.subredditName - The name of the subreddit where the action is performed.
 * @param {Object} res - The response object.
 * @returns {Object} The response indicating success or failure.
 */
async function moderatorRemove(req, res) {
  try {
    if (req.user) {
      const user = await User.findOne({ _id: req.user.userId });
      const { itemID, itemType, subredditName } = req.body;
      // Check if the user has moderator privileges
      const isModerator = user.moderators.some(
        (moderator) => moderator.subreddit === subredditName
      );
      if (!isModerator) {
        return res
          .status(403)
          .json({ message: "Forbidden, you must be a moderator!" });
      }
      switch (itemType) {
        case "report":
          const report = await Report.findById(itemID).populate("linkedItem");
          if (!report) {
            return res
              .status(404)
              .json({ success: false, message: "Report not found" });
          }

          // Mark the report as viewed
          report.isViewed = true;

          // Check if the linkedItem is a Post or Comment
          if (report.linkedItemType === "Post") {
            // Find the subreddit where the post belongs
            const subreddit = await Community.findOne({
              name: subredditName,
              posts: report.linkedItem,
            });

            if (!subreddit) {
              return res
                .status(404)
                .json({ success: false, message: "Subreddit not found" });
            }

            // Remove the post from the subreddit's posts array
            subreddit.posts.pull(report.linkedItem);

            // Add the post to the subreddit's removedItems array
            subreddit.removedItems.push({
              _id: report.linkedItem,
              linkedItemType: "Post",
            });

            await subreddit.save();
            // Mark the post as removed
            const post = await Post.findById(report.linkedItem);
            if (post) {
              post.isRemoved = true;
              await post.save();
            }
          } else if (report.linkedItemType === "Comment") {
            // Find the post to which the comment belongs
            const post = await Post.findOne({ comments: report.linkedItem });

            if (!post) {
              return res
                .status(404)
                .json({ success: false, message: "Post not found" });
            }

            // Remove the comment from the post's comments array
            post.comments.pull(report.linkedItem);

            await post.save();

            // Find the community (subreddit) to which the post belongs
            const community = await Community.findOne({
              name: subredditName,
            });

            if (!community) {
              return res
                .status(404)
                .json({ success: false, message: "Subreddit not found" });
            }

            // Add the comment to the community's removedItems array
            community.removedItems.push({
              _id: report.linkedItem,
              linkedItemType: "Comment",
            });

            await community.save();
            // Mark the comment as removed
            const comment = await Comment.findById(report.linkedItem);
            if (comment) {
              comment.isRemoved = true;
              await comment.save();
            }
          }

          // Find all reports linked to the same item
          const allReports = await Report.find({
            linkedItem: report.linkedItem,
          });

          // Update all found reports to be viewed
          for (const document of allReports) {
            document.isViewed = true;
            await document.save();
          }

          // Save the changes to the report
          await report.save();
          break;

        case "post":
          const post = await Post.findById(itemID);
          if (!post) {
            return res
              .status(404)
              .json({ success: false, message: "Post not found" });
          }
          // Find the subreddit where the post belongs
          const subreddit = await Community.findOne({
            name: subredditName,
            posts: itemID,
          });

          if (!subreddit) {
            return res
              .status(404)
              .json({ success: false, message: "Subreddit not found" });
          }

          // Remove the post from the subreddit's posts array
          subreddit.posts.pull(itemID);

          // Add the post to the subreddit's removedItems array
          subreddit.removedItems.push({
            _id: itemID,
            linkedItemType: "Post",
          });

          await subreddit.save();
          break;
      }

      return res.status(200).json({ message: "Item removed successfully" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

/**
 * Retrieves the removed items from the specified subreddit's removedItems array and populates the _id field based on the linkedItemType.
 * @param {object} req - The request object.
 * @param {object} req.user - The user object from the request.
 * @param {string} req.user.userId - The ID of the user making the request.
 * @param {object} req.params - The parameters object from the request.
 * @param {string} req.params.subredditName - The name of the subreddit to retrieve removed items from.
 * @param {object} res - The response object.
 * @returns {object} The response containing the removed items with populated _id field.
 */
async function getRemovedItems(req, res) {
  try {
    if (req.user) {
      const user = await User.findOne({ _id: req.user.userId });

      // Assuming subredditName is available in the request body or parameters
      const subredditName = req.params.subredditName;

      // Find the subreddit
      const subreddit = await Community.findOne({ name: subredditName });

      if (!subreddit) {
        return res
          .status(404)
          .json({ success: false, message: "Subreddit not found" });
      }
      // Check if the user has moderator privileges
      const isModerator = user.moderators.some(
        (moderator) => moderator.subreddit === subredditName
      );
      if (!isModerator) {
        return res
          .status(403)
          .json({ message: "Forbidden, you must be a moderator!" });
      }

      // Map through removedItems and populate each _id
      const populatedRemovedItems = await Promise.all(
        subreddit.removedItems.map(async (item) => {
          if (item.linkedItemType === "Post") {
            return await Post.findById(item._id);
          } else if (item.linkedItemType === "Comment") {
            return await Comment.findById(item._id);
          }
        })
      );

      return res
        .status(200)
        .json({ success: true, removedItems: populatedRemovedItems });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

/**
 * Approves the removal of a reported item or post, deleting it permanently from the database.
 * @async
 * @function approveRemoval
 * @param {Object} req - The request object.
 * @param {Object} req.user - The user object containing user information.
 * @param {string} req.user.userId - The ID of the user performing the action.
 * @param {Object} req.body - The request body containing item information.
 * @param {string} req.body.itemID - The ID of the item to permanently delete.
 * @param {string} req.body.itemType - The type of the item ('report' or 'post').
 * @param {string} req.body.subredditName - The name of the subreddit where the action is performed.
 * @param {Object} res - The response object.
 * @returns {Object} The response indicating success or failure.
 */
async function approveRemoval(req, res) {
  try {
    if (req.user) {
      const user = await User.findOne({ _id: req.user.userId });
      const { itemID, itemType, subredditName } = req.body;
      // Check if the user has moderator privileges
      const isModerator = user.moderators.some(
        (moderator) => moderator.subreddit === subredditName
      );
      if (!isModerator) {
        return res
          .status(403)
          .json({ message: "Forbidden, you must be a moderator!" });
      }
      let subreddit;
      switch (itemType) {
        case "report":
          const report = await Report.findById(itemID).populate("linkedItem");
          if (!report) {
            return res
              .status(404)
              .json({ success: false, message: "Report not found" });
          }

          // Remove linked item from Post or Comment schema
          if (report.linkedItemType === "Post") {
            await Post.findByIdAndDelete(report.linkedItem._id);
          } else if (report.linkedItemType === "Comment") {
            await Comment.findByIdAndDelete(report.linkedItem._id);
          }

          const subredditReport = await Community.findOne({
            name: subredditName,
          });

          if (!subredditReport) {
            return res
              .status(404)
              .json({ success: false, message: "Subreddit not found" });
          }

          // Remove the report from the database
          await Report.findByIdAndDelete(itemID);

          // Remove the item from the subreddit's removedItems array
          subredditReport.removedItems = subredditReport.removedItems.filter(
            (item) => !item._id.equals(report.linkedItem._id)
          );
          await subredditReport.save();

          break;

        case "post":
          // Find the subreddit
          subreddit = await Community.findOne({ name: subredditName });

          if (!subreddit) {
            return res
              .status(404)
              .json({ success: false, message: "Subreddit not found" });
          }
          await Post.findByIdAndDelete(itemID);

          // Remove the item from the subreddit's removedItems array
          subreddit.removedItems = subreddit.removedItems.filter(
            (item) => !item._id.equals(itemID)
          );
          await subreddit.save();

          break;
      }

      return res
        .status(200)
        .json({ message: "Item permanently deleted successfully" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

/**
 * Adds information to a subreddit such as rules or removal reasons.
 * @async
 * @function addSubredditInfo
 * @param {Object} req - The request object.
 * @param {Object} req.user - The user object containing user information.
 * @param {string} req.user.userId - The ID of the user performing the action.
 * @param {Object} req.body - The request body containing information to be added to the subreddit.
 * @param {string} req.body.subredditName - The name of the subreddit where the information will be added.
 * @param {string} req.body.type - The type of information to be added (e.g., "rule" or "removalReason").
 * @param {Object} req.body.info - The information to be added, format depends on the type.
 * @param {Object} res - The response object.
 * @returns {Object} The response indicating success or failure.
 */
async function addSubredditInfo(req, res) {
  try {
    if (req.user) {
      const user = await User.findOne({ _id: req.user.userId });
      const { subredditName, type, info } = req.body;

      // Find the subreddit by name
      const subreddit = await Community.findOne({ name: subredditName });
      if (!subreddit) {
        return res
          .status(404)
          .json({ success: false, message: "Subreddit not found" });
      }
      // Check if the user has moderator privileges
      const isModerator = user.moderators.some(
        (moderator) => moderator.subreddit === subredditName
      );
      if (!isModerator) {
        return res
          .status(403)
          .json({ message: "Forbidden, you must be a moderator!" });
      }
      // Validate the 'info' object based on the type
      if (type === "rule") {
        if (!info.appliesTo || !info.reportReason || !info.fullDescription) {
          return res.status(400).json({
            success: false,
            message: "Missing required fields for rule",
          });
        }
        // Remove the _id field to let MongoDB generate a unique ID
        delete info._id;
        subreddit.rules.push(info);
      } else if (type === "removalReason") {
        if (!info.title || !info.reasonMessage) {
          return res.status(400).json({
            success: false,
            message: "Missing required fields for removal reason",
          });
        }
        subreddit.removalReasons.push(info);
      } else {
        return res.status(400).json({ success: false, message: "Invalid type" });
      }

      // Save the changes
      await subreddit.save();

      return res
        .status(200)
        .json({ success: true, message: "Subreddit info added successfully" });
    }
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
}

/**
 * Deletes information from a subreddit such as rules or removal reasons.
 * @async
 * @function deleteSubredditInfo
 * @param {Object} req - The request object.
 * @param {Object} req.user - The user object containing user information.
 * @param {string} req.user.userId - The ID of the user performing the action.
 * @param {Object} req.body - The request body containing information to be deleted from the subreddit.
 * @param {string} req.body.subredditName - The name of the subreddit where the information will be deleted.
 * @param {string} req.body.type - The type of information to be deleted (e.g., "rule" or "removalReason").
 * @param {string} req.body.id - The ID of the information to be deleted.
 * @param {Object} res - The response object.
 * @returns {Object} The response indicating success or failure.
 */
async function deleteSubredditInfo(req, res) {
  try {
    if (req.user) {
      const user = await User.findOne({ _id: req.user.userId });
      const { subredditName, type, id } = req.body;

      // Find the subreddit by name
      const subreddit = await Community.findOne({ name: subredditName });
      if (!subreddit) {
        return res
          .status(404)
          .json({ success: false, message: "Subreddit not found" });
      }
      // Check if the user has moderator privileges
      const isModerator = user.moderators.some(
        (moderator) => moderator.subreddit === subredditName
      );
      if (!isModerator) {
        return res
          .status(403)
          .json({ message: "Forbidden, you must be a moderator!" });
      }

      // Validate the ID
      if (!id) {
        return res
          .status(400)
          .json({ success: false, message: "ID is required" });
      }

      // Find the index of the rule or removal reason
      let index;
      if (type === "rule") {
        index = subreddit.rules.findIndex((rule) => rule._id.toString() === id);
      } else if (type === "removalReason") {
        index = subreddit.removalReasons.findIndex(
          (reason) => reason._id.toString() === id
        );
      } else {
        return res.status(400).json({ success: false, message: "Invalid type" });
      }

      // Check if the rule or removal reason exists
      if (index === -1) {
        return res
          .status(404)
          .json({ success: false, message: "Item not found" });
      }

      // Remove the rule or removal reason
      if (type === "rule") {
        subreddit.rules.splice(index, 1);
      } else if (type === "removalReason") {
        subreddit.removalReasons.splice(index, 1);
      }

      // Save the changes
      await subreddit.save();

      return res
        .status(200)
        .json({ success: true, message: "Subreddit info deleted successfully" });
    }
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
}

/**
 * Retrieves information from a subreddit based on the type (e.g., rules or removal reasons).
 * @async
 * @function getSubredditInfoByType
 * @param {Object} req - The request object.
 * @param {Object} req.user - The user object containing user information.
 * @param {string} req.user.userId - The ID of the user performing the action.
 * @param {Object} req.params - The request parameters.
 * @param {string} req.params.subredditName - The name of the subreddit to retrieve information from.
 * @param {string} req.params.type - The type of information to retrieve (e.g., "rules" or "removalReasons").
 * @param {Object} res - The response object.
 * @returns {Object} The response containing the requested information.
 */
async function getSubredditInfoByType(req, res) {
  try {
    if (req.user) {
      const user = await User.findOne({ _id: req.user.userId });
      const { subredditName, type } = req.params;

      // Find the subreddit by name
      const subreddit = await Community.findOne({ name: subredditName });
      if (!subreddit) {
        return res
          .status(404)
          .json({ success: false, message: "Subreddit not found" });
      }
      // Check if the user has moderator privileges
      const isModerator = user.moderators.some(
        (moderator) => moderator.subreddit === subredditName
      );
      if (!isModerator) {
        return res
          .status(403)
          .json({ message: "Forbidden, you must be a moderator!" });
      }
      let infoArray;
      if (type === "rules") {
        infoArray = subreddit.rules;
      } else if (type === "removalReasons") {
        infoArray = subreddit.removalReasons;
      } else {
        return res
          .status(400)
          .json({ success: false, message: "Invalid type" });
      }

      return res.status(200).json({ success: true, [type]: infoArray });
    }
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
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
  getMineModeration,
  getUserMuted,
  getSubredditModerator,
  getUnmoderated,
  editPermissions,
  getModeratedCommunitiesByUsername,
  banUser,
  unbanUser,
  getBannedUsers,
  moderatorApprove,
  moderatorRemove,
  getRemovedItems,
  approveRemoval,
  addSubredditInfo,
  deleteSubredditInfo,
  getSubredditInfoByType,
};
