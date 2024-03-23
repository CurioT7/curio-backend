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
  const sub = req.params.subreddit;
  const subreddit = await subredditModel.findOne({ name: sub });
  if (!subreddit) {
    return res
      .status(404)
      .json({ success: false, message: "Subreddit not found" });
  }
  try {
    const randomPost =
      subreddit.posts[Math.floor(Math.random() * subreddit.posts.length)];
    res.status(200).json({ success: true, post: randomPost });
  } catch (err) {
    res
      .status(400)
      .json({ success: false, message: "Error getting random post" });
  }
}

/**
 * Get the top-viewed posts from a subreddit, or a random post if there are no top-viewed posts.
 * @async
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 * @returns {Promise<Object>} - The top-viewed post or a random post.
 */
async function getTopPosts(req, res) {
  try {
    const subredditName = req.params.subreddit;
    // Find the subreddit
    const subreddit = await subredditModel.findOne({ name: subredditName });

    if (!subreddit) {
      return res
        .status(404)
        .json({ success: false, message: "Subreddit not found" });
    }

    // Find top-viewed posts sorted by views in descending order
    const topPosts = await Post.find({ linkedSubreddit: subreddit._id })
      .sort({ views: -1 })
      .limit(1)
      .lean(); // Using lean() to convert documents to plain JavaScript objects

    if (topPosts.length > 0) {
      // If top-viewed posts exist, increment views of the first post
      const topPost = topPosts[0];
      await Post.updateOne({ _id: topPost._id }, { $inc: { views: 1 } });
      res.status(200).json({ success: true, post: topPost });
    }
  } catch (error) {
    res.status(400).json({ success: false, message: "Error getting top post" });
  }
}

module.exports = {
  randomPost,
  getTopPosts,
};
