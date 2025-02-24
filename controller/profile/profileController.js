const User = require("../../models/userModel");
const Post = require("../../models/postModel");
const Comment = require("../../models/commentModel");
const Subreddit = require("../../models/subredditModel");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const brypt = require("bcrypt");
const { verifyToken } = require("../../utils/tokens");
const { getFilesFromS3 } = require("../../utils/s3-bucket");
const { getVoteStatusAndSubredditDetails } = require("../../utils/posts");

/**
 * Finds a user by their username.
 * @param {string} username - The username of the user to find.
 * @returns {Promise<Object>} A Promise that resolves to the user object if found.
 * @throws {Error} Throws an error if the user is not found.
 */
async function findUserByUsername(username) {
  const user = await User.findOne({ username });
  if (!user) {
    throw new Error("User not found");
  }
  return user;
}

/**
 * Handles server errors by logging them and sending an error response.
 * @param {Object} res - The response object.
 * @param {Error} error - The error object representing the server error.
 */
function handleServerError(res, error) {
  console.error(error);
  res.status(500).json({
    success: false,
    message: "Server Error",
    error: error.message,
  });
}

/**
 * Fetches posts made by a specific user.
 * @param {string} username - The username of the user whose posts are to be fetched.
 * @returns {Promise<Array>} A Promise that resolves to an array of posts made by the user.
 */
async function fetchPostsByUsername(username) {
  const posts = await Post.find({ authorName: username }).populate(
    "originalPostId"
  );
  // Increment the view count for each post
  for (const post of posts) {
    post.views += 1;
    await post.save();
    if (post.media) {
      post.media = await getFilesFromS3(post.media);
    }
  }
  return posts;
}

/**
 * Fetches comments made by a specific user.
 * @param {string} username - The username of the user whose comments are to be fetched.
 * @returns {Promise<Array>} A Promise that resolves to an array of comments made by the user.
 */
async function fetchCommentsByUsername(username) {
  const comments = await Comment.find({ authorName: username });
  return comments;
}

/**
 * Retrieves posts made by a specific user.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {Promise<void>} A Promise that resolves once the operation is complete.
 */
async function getPostsByUser(req, res, next) {
  try {
    const { username } = req.params;

    const user = await findUserByUsername(username);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Fetch posts by the user
    const posts = await fetchPostsByUsername(username);

    // Get vote status and subreddit details for each post
    const detailsArray = await getVoteStatusAndSubredditDetails(posts, user);

    // Combine posts and their details
    const postsWithDetails = posts.map((post, index) => {
      return { ...post.toObject(), details: detailsArray[index] };
    });

    res.status(200).json(postsWithDetails);
  } catch (error) {
    handleServerError(res, error);
  }
}

/**
 * Retrieves comments made by a specific user.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {Promise<void>} A Promise that resolves once the operation is complete.
 */
async function getCommentsByUser(req, res, next) {
  try {
    const { username } = req.params;
    const user = await findUserByUsername(username);
    // Fetch comments by the user
    const comments = await fetchCommentsByUsername(username);

    // Get vote status and subreddit details for each comment
    const detailsArray = await getVoteStatusAndSubredditDetails(comments,user);

    // Combine comments and their details
    const commentsWithDetails = comments.map((comment, index) => {
      return { ...comment.toObject(), details: detailsArray[index] };
    });

    res.status(200).json(commentsWithDetails);
  } catch (error) {
    handleServerError(res, error);
  }
}

/**
 * Fetches content (posts and comments) upvoted or downvoted by the user.
 *
 * @param {Object} req - Request object containing the user's username in URL params.
 * @param {Object} res - Response object for sending responses.
 * @param {Function} next - Next middleware function.
 * @param {string} voteType - Determines whether to fetch "upvotes" or "downvotes".
 */
async function getVotedContent(req, res, next, voteType) {
  try {
    if (req.user) {
      const user = await User.findOne({ _id: req.user.userId });

      let votedIds;
      if (voteType === "upvotes" || voteType === "downvotes") {
        votedIds = user[voteType].map((vote) => vote.itemId);
        console.log(votedIds);
      } else {
        return res
          .status(400)
          .json({ success: false, message: "Invalid vote type" });
      }

      const votedPosts = await Post.find({ _id: { $in: votedIds } });
      const votedComments = await Comment.find({ _id: { $in: votedIds } });

      res.status(200).json({
        votedPosts,
        votedComments,
      });
    }
  } catch (error) {
    handleServerError(res, error);
  }
}

/**
 * Fetches all posts upvoted by the user.
 */
async function getUpvotedContent(req, res, next) {
  await getVotedContent(req, res, next, "upvotes");
}

/**
 * Fetches all posts downvoted by the user.
 */
async function getDownvotedContent(req, res, next) {
  await getVotedContent(req, res, next, "downvotes");
}

/**
 * Retrieves detailed profile information about a user, including their moderated subreddits.
 *
 * @param {Object} req - Request object containing the user's username.
 * @param {Object} res - Response object for sending the detailed user profile.
 * @param {Function} next - Next middleware function.
 */
async function getAboutInformation(req, res, next) {
  try {
    const { username } = req.params;
    const user = await findUserByUsername(username);

    // Aggregate information about the user.
    const followersCount = user.followers.length;
    const followingCount = user.followings.length;
    const goldReceived = user.goldAmount;
    const cakeDay = user.cakeDay;
    const socialLinks = user.socialLinks;
    const about = user.about;
    const displayName = user.displayName;
    const isOver18 = user.isOver18;
    let banner;
    let profilePicture;

    // Fetch the profile picture from S3 if available
    if (user.profilePicture) {
      profilePicture = await getFilesFromS3(user.profilePicture);
      user.profilePicture = profilePicture;
    }
    if (user.banner) {
      banner = await getFilesFromS3(user.banner);
      user.banner = banner;
    }

    // Get subreddits where the user is a moderator or creator
    const moderatedSubredditsUsernames = user.moderators.map(
      (moderator) => moderator.subreddit
    );
    const moderatedSubreddits = await Subreddit.find({
      name: { $in: moderatedSubredditsUsernames },
    });
    // Calculate karma from posts and comments.
    const userPosts = await fetchPostsByUsername(username);
    let postKarma = 0;

    for (const post of userPosts) {
      postKarma += post.karma;
    }

    const userComments = await fetchCommentsByUsername(username);
    let commentKarma = 0;

    for (const comment of userComments) {
      commentKarma += comment.karma;
    }

    res.status(200).json({
      banner,
      about,
      cakeDay,
      commentKarma,
      displayName,
      followersCount,
      followingCount,
      goldReceived,
      isOver18,
      moderatedSubreddits,
      postKarma,
      profilePicture,
      socialLinks,
    });
  } catch (error) {
    handleServerError(res, error);
  }
}

/**
 * Retrieves overview information about a user including their posts and comments.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {Promise<void>} A Promise that resolves once the operation is complete.
 */
async function getOverviewInformation(req, res, next) {
  try {
    const { username } = req.params;
    const user = await findUserByUsername(username);

    // Get all posts and comments by the user
    const userPosts = await fetchPostsByUsername(username);
    const userComments = await fetchCommentsByUsername(username);

    res.status(200).json({
      userPosts,
      userComments,
    });
  } catch (error) {
    handleServerError(res, error);
  }
}

/**
 * Controller function to get joined/moderated communities by a user.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @returns {Promise<void>} A promise that resolves once the response is sent.
 */
async function getJoinedCommunities(req, res) {
  const username = req.params.username;

  try {
    const user = await findUserByUsername(username);

    const subredditNames = user.subreddits.map((sub) => sub.subreddit);

    let communities = await Subreddit.find({
      name: { $in: subredditNames },
    }).exec();

    // Add member count to each community
    communities = communities.map((community) => {
      const memberCount = community.members.length;
      return { ...community._doc, memberCount };
    });

    return res.status(200).json({ success: true, communities });
  } catch (error) {
    console.error("Error fetching user communities:", error);
    return res
      .status(500)
      .json({ success: false, error: "Failed to fetch user communities" });
  }
}

module.exports = {
  getJoinedCommunities,
  getPostsByUser,
  getCommentsByUser,
  getUpvotedContent,
  getDownvotedContent,
  getAboutInformation,
  getOverviewInformation,
};
