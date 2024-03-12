const User = require("../../models/userModel");
const Post = require("../../models/postModel");
const Comment = require("../../models/commentModel");

/**
 * ProfileController class for handling user profile operations.
 */
class ProfileController {
  /**
   * Retrieves data (posts or comments) made by a specific user.
   * @param {Object} req - The request object containing parameters and the request body.
   * @param {Object} res - The response object used to return data or messages.
   * @param {Function} next - The next middleware function in the stack.
   * @param {String} dataType - Type of data to retrieve (either "posts" or "comments").
   * @async
   */
  getDataByUser = async (req, res, next, dataType) => {
    try {
      const { username } = req.params;
      const user = await User.findOne({ username });
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
   * Retrieves all posts made by a specific user.
   * @param {Object} req - The request object containing parameters and the request body.
   * @param {Object} res - The response object used to return data or messages.
   * @param {Function} next - The next middleware function in the stack.
   * @async
   */
  getPostsByUser = async (req, res, next) => {
    await this.getDataByUser(req, res, next, "posts");
  };

  /**
   * Retrieves all comments made by a specific user.
   * @param {Object} req - The request object containing parameters and the request body.
   * @param {Object} res - The response object used to return data or messages.
   * @param {Function} next - The next middleware function in the stack.
   * @async
   */
  getCommentsByUser = async (req, res, next) => {
    await this.getDataByUser(req, res, next, "comments");
  };

  /**
   * Retrieves all upvoted posts and comments by a specific user.
   * This method aggregates upvoted posts and comments into a single response.
   * @param {Object} req - The request object.
   * @param {Object} res - The response object.
   * @param {Function} next - The next middleware function in the stack.
   */
  getUpvotedContent = async (req, res, next) => {
    try {
      const { username } = req.params;
      const user = await User.findOne({ username });

      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      // Separate queries for posts and comments based on upvotes array
      const upvotedPostIds = user.upvotes
        .filter((vote) => vote.itemType === "Post")
        .map((vote) => vote.itemId);
      const upvotedCommentIds = user.upvotes
        .filter((vote) => vote.itemType === "Comment")
        .map((vote) => vote.itemId);

      const upvotedPosts = await Post.find({ _id: { $in: upvotedPostIds } });
      const upvotedComments = await Comment.find({
        _id: { $in: upvotedCommentIds },
      });

      res.status(200).json({
        upvotedPosts,
        upvotedComments,
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
}

module.exports = ProfileController;
