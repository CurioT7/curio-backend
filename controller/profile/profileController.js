const User = require("../../models/userModel");
const Post = require("../../models/postModel");
const Comment = require("../../models/commentModel");
const Subreddit = require("../../models/subredditModel");

/**
 * Handles operations related to user profiles, including fetching posts, comments,
 * and voting information specific to a user.
 */
class ProfileController {
  /**
   * Retrieves either posts or comments made by a specific user, based on the dataType parameter.
   * @param {Object} req - The request object, containing URL parameters.
   * @param {Object} res - The response object used to return data or messages.
   * @param {Function} next - The next middleware function in the stack.
   * @param {String} dataType - Specifies the type of data to retrieve: "posts" or "comments".
   * @async
   */
  getDataByUser = async (req, res, next, dataType) => {
    try {
      const { username } = req.params;
      const user = await User.findOne({ username });
      // Checks if user exists.
      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      let data;
      if (dataType === "posts") {
        data = await Post.find({ authorName: username });
      } else if (dataType === "comments") {
        data = await Comment.find({ authorName: username });
      }

      res.status(200).json(data);
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Server Error",
        error: error.message,
      });
    }
  };

  /**
   * Wrapper for getDataByUser to specifically fetch posts.
   */
  getPostsByUser = async (req, res, next) => {
    await this.getDataByUser(req, res, next, "posts");
  };

  /**
   * Wrapper for getDataByUser to specifically fetch comments.
   */
  getCommentsByUser = async (req, res, next) => {
    await this.getDataByUser(req, res, next, "comments");
  };

  /**
   * Fetches content (posts and comments) upvoted or downvoted by the user.
   *
   * @param {Object} req - Request object containing the user's username in URL params.
   * @param {Object} res - Response object for sending responses.
   * @param {Function} next - Next middleware function.
   * @param {string} voteType - Determines whether to fetch "upvotes" or "downvotes".
   */
  getVotedContent = async (req, res, next, voteType) => {
    try {
      const { username } = req.params;
      const user = await User.findOne({ username });

      if (!user || typeof user !== "string") {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      let filterFunction;
      if (voteType === "upvotes") {
        filterFunction = (vote) =>
          vote.itemType === "Post" || vote.itemType === "Comment";
      } else if (voteType === "downvotes") {
        filterFunction = (vote) =>
          vote.itemType === "Post" || vote.itemType === "Comment";
      } else {
        return res
          .status(400)
          .json({ success: false, message: "Invalid vote type" });
      }

      const votedIds = user[voteType]
        .filter(filterFunction)
        .map((vote) => vote.itemId);

      const votedPosts = await Post.find({ _id: { $in: votedIds } });
      const votedComments = await Comment.find({ _id: { $in: votedIds } });

      res.status(200).json({
        votedPosts,
        votedComments,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Server Error",
        error: error.message,
      });
    }
  };

  /**
   * Fetches all posts upvoted by the user.
   */
  getUpvotedContent = async (req, res, next) => {
    await this.getVotedContent(req, res, next, "upvotes");
  };

  /**
   * Fetches all posts downvoted by the user.
   */
  getDownvotedContent = async (req, res, next) => {
    await this.getVotedContent(req, res, next, "downvotes");
  };

  /**
   * Retrieves detailed profile information about a user, including their moderated subreddits.
   *
   * @param {Object} req - Request object containing the user's username.
   * @param {Object} res - Response object for sending the detailed user profile.
   * @param {Function} next - Next middleware function.
   */
  getAboutInformation = async (req, res, next) => {
    try {
      const { username } = req.params;
      const user = await User.findOne({ username: username });
      if (!user) {
        return res.status(404).json({
          sucess: false,
          message: "user not found",
        });
      }
      // Aggregate information about the user.
      const followersCount = user.followers.length;
      const followingCount = user.followings.length;
      const goldReceived = user.goldAmount;
      const cakeDay = user.cakeDay;
      const socialLinks = user.socialLinks;
      const bio = user.bio;
      const displayName = user.displayName;
      const banner = user.banner;
      const profilePicture = user.profilePicture;
      const isOver18 = user.isOver18;

      // Extract subreddit IDs where the user is a moderator
      const moderatedSubredditIds = user.subreddits
        .filter((sub) => sub.role === "moderator")
        .map((sub) => sub.subreddit);

      // Fetch subreddit details for those IDs
      const moderatedSubreddits = await Subreddit.find({
        _id: { $in: moderatedSubredditIds },
      });

      // Calculate karma from posts and comments.
      const userPosts = await Post.find({ authorName: username });
      let postKarma = 0;

      for (const post of userPosts) {
        postKarma += post.karma;
      }

      const userComments = await Comment.find({ authorName: username });
      let commentKarma = 0;

      for (const comment of userComments) {
        commentKarma += comment.karma;
      }
      // Respond with aggregated user information.
      res.status(200).json({
          banner,
          bio,
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
      console.error("Error fetching followers:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };
}

module.exports = ProfileController;
