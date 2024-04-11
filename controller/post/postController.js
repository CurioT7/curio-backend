const Post = require("../../models/postModel");
const Comment = require("../../models/commentModel");

/**
 * Retrieves all comments for a given post.
 * @async
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 * @returns {Object} - The response object containing the comments.
 */

async function getPostComments(req, res) {
  const postId = req.body.postId;
  try {
    const post = await Post.findOne({ _id: postId });
    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }
    const comments = await Comment.find({ linkedPost: postId });
    if (!comments) {
      return res
        .status(404)
        .json({ success: false, message: "No comments found" });
    }
    return res.status(200).json({ success: true, comments });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
}

module.exports = { getPostComments };
