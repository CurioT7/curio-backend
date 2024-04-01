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
   * Finds a user by their username.
   * @param {string} username - The username of the user to find.
   * @returns {Promise<Object>} A Promise that resolves to the user object if found.
   * @throws {Error} Throws an error if the user is not found.
   */
  async findUserByUsername(username) {
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
  handleServerError = (res, error) => {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  };

  /**
   * Fetches posts made by a specific user.
   * @param {string} username - The username of the user whose posts are to be fetched.
   * @returns {Promise<Array>} A Promise that resolves to an array of posts made by the user.
   */
  async fetchPostsByUsername(username) {
    const posts = await Post.find({ authorName: username });
    // Increment the view count for each post
    for (const post of posts) {
      post.views += 1;
      await post.save();
    }
    return posts;
  }

  /**
   * Fetches comments made by a specific user.
   * @param {string} username - The username of the user whose comments are to be fetched.
   * @returns {Promise<Array>} A Promise that resolves to an array of comments made by the user.
   */
  async fetchCommentsByUsername(username) {
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
  getPostsByUser = async (req, res, next) => {
    try {
      const { username } = req.params;
      const user = await this.findUserByUsername(username);
      // Fetch posts by the user
      const posts = await this.fetchPostsByUsername(username);
      res.status(200).json(posts);
    } catch (error) {
      this.handleServerError(res, error);
    }
  };

  /**
   * Retrieves comments made by a specific user.
   * @param {Object} req - The request object.
   * @param {Object} res - The response object.
   * @param {Function} next - The next middleware function.
   * @returns {Promise<void>} A Promise that resolves once the operation is complete.
   */
  getCommentsByUser = async (req, res, next) => {
    try {
      const { username } = req.params;
      const user = await this.findUserByUsername(username);
      // Fetch comments by the user
      const comments = await this.fetchCommentsByUsername(username);
      res.status(200).json(comments);
    } catch (error) {
      this.handleServerError(res, error);
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
      this.handleServerError(res, error);
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

      // Get subreddits where the user is a moderator or creator
      const moderatedSubredditsUsernames = user.moderators.map(
        (moderator) => moderator.subreddit.username
      );
      const moderatedSubreddits = await Subreddit.find({
        username: { $in: moderatedSubredditsUsernames },
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
      this.handleServerError(res, error);
    }
  };

  /**
   * Retrieves overview information about a user including their posts and comments.
   * @param {Object} req - The request object.
   * @param {Object} res - The response object.
   * @param {Function} next - The next middleware function.
   * @returns {Promise<void>} A Promise that resolves once the operation is complete.
   */
  getOverviewInformation = async (req, res, next) => {
    try {
      const { username } = req.params;
      const user = await this.findUserByUsername(username);

      // Get all posts and comments by the user
      const userPosts = await this.fetchPostsByUsername(username);
      const userComments = await this.fetchCommentsByUsername(username);

      res.status(200).json({
        userPosts,
        userComments,
      });
    } catch (error) {
      this.handleServerError(res, error);
    }
  };
  /**
   * Controller function to get joined/moderated communities by a user.
   * @param {object} req - The request object.
   * @param {object} res - The response object.
   * @returns {Promise<void>} A promise that resolves once the response is sent.
   */
  getJoinedCommunities = async (req, res) => {
    const username = req.params.username;

    try {
      const user = await this.findUserByUsername(username);

      // Get the user's joined/moderated communities from the subreddits field
      const communitiesSubredditIds = user.subreddits.map(
        (sub) => sub.subreddit
      );
      const communities = await Subreddit.find({
        _id: { $in: communitiesSubredditIds },
      });

      return res.status(200).json({ success: true, communities });
    } catch (error) {
      console.error("Error fetching user communities:", error);
      return res
        .status(500)
        .json({ success: false, error: "Failed to fetch user communities" });
    }
  };
}

module.exports = ProfileController;
