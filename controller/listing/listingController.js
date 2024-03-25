const Subreddit = require("../../models/subredditModel");
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
  const subreddit = await Subreddit.findOne({ name: sub });
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
    const subreddit = await Subreddit.findOne({ name: subredditName });

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

/**
 * Retrieves the best posts based on the proportion of upvotes to downvotes.
 * @async
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 * @returns {Promise<void>} - A promise that resolves when the operation is complete.
 */
async function getBestPosts(req, res) {
  try {
    // Fetch all posts from the database
    const posts = await Post.find({});

     if (posts.length === 0) {
       return res.status(404).json({
         success: false,
         message: "No posts found in the database",
       });
     }
    
    // Sort the posts using the best algorithm
    const sortedPosts = posts.sort((a, b) => {
      const karmaA = a.upvotes - a.downvotes;
      const karmaB = b.upvotes - b.downvotes;

      // Calculate the proportion of upvotes to downvotes for each post
      const proportionA = karmaA > 0 ? karmaA / (karmaA + a.downvotes) : 0;
      const proportionB = karmaB > 0 ? karmaB / (karmaB + b.downvotes) : 0;

      // Sort posts based on the proportion of upvotes to downvotes
      return proportionB - proportionA;
    });

    res.status(200).json({ success: true, SortedPosts: sortedPosts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}

module.exports = {
  randomPost,
  getTopPosts,
  getBestPosts,
};
