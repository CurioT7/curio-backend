const subredditModel = require("../../models/subredditModel");
const Post = require("../../models/postModel");
const moment = require("moment");

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
    const decodedURI = decodeURIComponent(req.params.subreddit);
    const subreddit = await subredditModel.findOne({ name: decodedURI });

    if (!subreddit) {
      return res
        .status(404)
        .json({ success: false, message: "Subreddit not found" });
    }

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

/**
 * Get the top-viewed posts from a subreddit, or a random post if there are no top-viewed posts.
 * @async
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 * @returns {Promise<Object>} - The top-viewed post or a random post.
 */
async function getTopPostsbytime(req, res) {
  try {
    const decodedURI = decodeURIComponent(req.params.subreddit);
    const subreddit = await subredditModel.findOne({ name: decodedURI });

    if (!subreddit) {
      return res
        .status(404)
        .json({ success: false, message: "Subreddit not found" });
    }

    // Get the time threshold from the URL parameter
    const timeThreshold = moment()
      .subtract(req.params.timeThreshold, "days")
      .toDate();

    // Find top-viewed posts sorted by upvotes and filtered by creation time
    const topPosts = await Post.find({
      linkedSubreddit: subreddit._id,
      createdAt: { $gte: timeThreshold }, // Filter posts created after the time threshold
    }).sort({ upvotes: -1 });

    if (topPosts.length > 0) {
      // Increment views of the first post if top posts exist
      await Post.updateOne({ _id: topPosts[0]._id }, { $inc: { views: 1 } });
      return res.status(200).json({ success: true, post: topPosts });
    } else {
      return res
        .status(404)
        .json({
          success: false,
          message: "No top posts found within the specified time",
        });
    }
  } catch (error) {
    return res
      .status(400)
      .json({ success: false, message: "Error getting top post" });
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
    const decodedURI = decodeURIComponent(req.params.subreddit);
    const subreddit = await subredditModel.findOne({ name: decodedURI });

    if (!subreddit) {
      return res
        .status(404)
        .json({ success: false, message: "Subreddit not found" });
    }

    // Find top-viewed posts sorted by upvotes in descending order
    const topPosts = await Post.find({ linkedSubreddit: subreddit._id }).sort({
      upvotes: -1,
    });

    if (topPosts.length > 0) {
      // If top-viewed posts exist, increment views of the first post
      for (const post of topPosts) {
        await Post.updateOne({ _id: post._id }, { $inc: { views: 1 } });
      }
      return res.status(200).json({ success: true, post: topPosts });
    } else {
      return res
        .status(404)
        .json({ success: false, message: "No top posts found" });
    }
  } catch (error) {
    return res
      .status(400)
      .json({ success: false, message: "Error getting top post" });
  }
}

module.exports = {
  randomPost,
  getTopPosts,
  getTopPostsbytime,
};
