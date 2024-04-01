const Subreddit = require("../../models/subredditModel");
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
    const subreddit = await Subreddit.findOne({ name: decodedURI });

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
async function getTopPosts(req, res) {
  try {
    const subredditName = decodeURIComponent(req.params.subreddit);
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
 * Get the newest posts from a subreddit.
 * @async
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 * @returns {Promise<Object>} - The newest posts.
 */
 
async function newPosts (req, res) {
  try {
    const subredditName = decodeURIComponent(req.params.subreddit);
    const subreddit = await Subreddit.findOne({ name: subredditName });
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
    const subredditName = decodeURIComponent(req.params.subreddit);
    const subreddit = await Subreddit.findOne({ name: subredditName });
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

async function mostComments(req, res) {
  try {
    const subredditName = decodeURIComponent(req.params.subreddit);
    const subreddit = await Subreddit.findOne({ name: subredditName });

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

/**
 * Get the top-viewed posts from a subreddit, by an interval time
 * @async
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 * @returns {Promise<Object>} - The top-viewed post
 */
async function getTopPostsbytime(req, res) {
  try {
    const subredditName = decodeURIComponent(req.params.subreddit);
    const subreddit = await Subreddit.findOne({ name: subredditName });

    if (!subreddit) {
      return res
        .status(404)
        .json({ success: false, message: "Subreddit not found" });
    }

    // Get the time threshold based on the request
    let timeThreshold;
    if (req.params.time === "new") {
      // Set time threshold to 2 hours ago
      timeThreshold = moment().subtract(2, "hours").toDate();
    } else {
      // Default time threshold is 24 hours ago
      timeThreshold = moment()
        .subtract(req.params.timeThreshold, "days")
        .toDate();
    }

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
      return res.status(404).json({
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
  newPosts,
  hotPosts, 
  mostComments,
  getTopPostsbytime,
  getBestPosts,
};
