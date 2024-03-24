const subredditModel = require("../../models/subredditModel");
const Post = require("../../models/postModel");

/**
 * Get a random post from a subreddit.
 * @async
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 * @returns {Object} - The response object containing the random post.
 */

async function randomPost(req, res) {
  // random post linked with the subreddit
  try {
    const subreddit = await subredditModel.findOne({
      name: req.params.subreddit,
    });
    const posts = await Post.find({ linkedSubreddit: subreddit._id });
    if (posts.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No posts found in the subreddit" });
    }
    const randomPost = posts[Math.floor(Math.random() * posts.length)];
    //increase of the number of views
    randomPost.views += 1;
    await randomPost.save();
    return res.status(200).json({ success: true, post: randomPost });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

module.exports = { randomPost };
