const User = require("../../models/userModel");
const Post = require("../../models/postModel");
const Comment = require("../../models/commentModel");
const Subreddit = require("../../models/subredditModel");

/**
 * Handles operations related to user profiles, including fetching posts, comments,
 * and voting information specific to a user.
 */
class ProfileController {
  async findUserByUsername(username) {
    const user = await User.findOne({ username });
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  }
  async fetchPostsByUsername(username) {
    const posts = await Post.find({ authorName: username });
    return posts;
  }

  async fetchCommentsByUsername(username) {
    const comments = await Comment.find({ authorName: username });
    return comments;
  }

  // Route handlers that utilize the fetching functions and handle responses
  getPostsByUser = async (req, res, next) => {
    try {
      const { username } = req.params;
      const user = await this.findUserByUsername(username);
      const posts = await this.fetchPostsByUsername(username);
      res.status(200).json(posts);
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Server Error",
        error: error.message,
      });
    }
  };

  getCommentsByUser = async (req, res, next) => {
    try {
      const { username } = req.params;
      const user = await this.findUserByUsername(username);
      const comments = await this.fetchCommentsByUsername(username);
      res.status(200).json(comments);
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
      const user = await this.findUserByUsername(username);

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
      const user = await this.findUserByUsername(username);

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
      const userPosts = await this.fetchPostsByUsername(username);
      let postKarma = 0;

      for (const post of userPosts) {
        postKarma += post.karma;
      }

      const userComments = await this.fetchCommentsByUsername(username);
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
