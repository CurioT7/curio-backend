const User = require("../../models/userModel");
const Post = require("../../models/postModel");
/**
 * ProfileController class for handling user profile operations.
 */
class ProfileController {
  /**
   * Retrieves all posts made by a specific user.
   * @param {Object} req - The request object containing parameters and the request body.
   * @param {Object} res - The response object used to return data or messages.
   * @param {Function} next - The next middleware function in the stack.
   * @async
   */
  getPostsByUser = async (req, res, next) => {
    try {
      const { username } = req.params;
      const user = await User.findOne({ username });
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
      const posts = await Post.find({ authorName: username });
      res.status(200).json(posts);
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
  };
}

module.exports = ProfileController;
