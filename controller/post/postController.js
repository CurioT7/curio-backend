const Post = require("../../models/postModel");
const Comment = require("../../models/commentModel");

// Function to retrieve all comments for a post.
/**
 * Retrieves all comments for a post.
 * @async
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {object} - Express response object
 */
async function getPostComments(req, res) {
  try {
    const postId = req.body.postId;
    const post = await Post.findById(postId);
    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found." });
    }
    const postComments = await Comment.find({ linkedPost: postId });
    return res.status(200).json({ success: true, comments: postComments });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "Internal server Error" });
  }
}

module.exports = { getPostComments };
