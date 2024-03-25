const subredditModel = require("../../models/subredditModel");
const Post = require("../../models/postModel");
const { post } = require("../../router/listingRouter");

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
 * Get the newest posts from a subreddit.
 * @async
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 * @returns {Promise<Object>} - The newest posts.
 */
 
async function newPosts (req, res) {
  try {
    const subredditName = req.params.subreddit;
    const subreddit = await subredditModel.findOne({ name: subredditName });
    if (!subreddit) {
      return res.status(404).json({ success: false, message: "Subreddit not found" });
    }

    const posts = await Post.find({ linkedSubreddit: subreddit._id }).sort({
      createdAt: -1
     });

     for (const post of posts) {
      await Post.updateOne({ _id: post._id }, { $inc: { views: 1 } });
    }

    
    return res.status(200).json({ success: true, posts });

  } catch (error) {
    return res.status(400).json({ success: false, message: "Error getting new posts" });
  }

}

/**
 * Get the hot posts from a subreddit.
 * @async
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 * @returns {Promise<Object>} - The hot posts.
 */

async function hotPosts (req, res) {
  try {
    const subredditName = req.params.subreddit;
    const subreddit = await subredditModel.findOne({ name: subredditName });
    if (!subreddit) {
      return res.status(404).json({ success: false, message: "Subreddit not found" });
    }

    const posts = await Post.find({ linkedSubreddit: subreddit._id }).sort({
      views: -1
     });

      for (const post of posts) {
      await Post.updateOne({ _id: post._id }, { $inc: { views: 1 } });
     } 
    
    return res.status(200).json({ success: true, posts });

  } catch (error) {
    return res.status(400).json({ success: false, message: "Error getting hot posts" });
  }

}

/**
 * Get the posts with the most comments from a subreddit.
 * @async
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 * @returns {Promise<Object>} - The posts with the most comments.
 */

async function mostComments (req, res) {
  try {
    const subredditName = req.params.subreddit;
    const subreddit = await subredditModel.findOne({ name: subredditName });
    if (!subreddit) {
      return res.status(404).json({ success: false, message: "Subreddit not found" });
    }

    const posts = await Post.find({ linkedSubreddit: subreddit._id }).populate({
      path: 'comments',
      select: '_id',
    });
    posts.forEach(post => {
      post.numComments = post.comments.length; // Number of comments is the length of the comments array
    });

    posts.sort((a, b) => b.numComments - a.numComments);

    
    return res.status(200).json({ success: true, posts });

  } catch (error) {
    return res.status(400).json({ success: false, message: "Error getting posts with most comments" });
  }

}

module.exports = {
  randomPost,
  getTopPosts,
  newPosts,
  hotPosts, 
  mostComments
};
