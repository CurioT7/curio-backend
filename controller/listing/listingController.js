const Subreddit = require("../../models/subredditModel");
const Post = require("../../models/postModel");
const moment = require("moment");
const { verifyToken } = require("../../utils/tokens");

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
 * Get posts from a subreddit based on the type of posts requested.
 * @async
 *  @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 * @returns {Object} - The response object containing the posts.
 */
async function getPosts(req, res) {
  try {
    const subredditName = decodeURIComponent(req.params.subreddit);
    const subreddit = await Subreddit.findOne({ name: subredditName });

    if (!subreddit) {
      return res
        .status(404)
        .json({ success: false, message: "Subreddit not found" });
    }

    let posts = [];

    switch (req.params.type) {
      case "top":
        posts = await getTopPosts(subreddit._id);
        break;
      case "new":
        posts = await getNewPosts(subreddit._id);
        break;
      case "hot":
        posts = await getHotPosts(subreddit._id);
        break;
      case "most_commented":
        posts = await getMostCommentedPosts(subreddit._id);
        break;
      default:
        return res
          .status(400)
          .json({ success: false, message: "Invalid post type" });
    }

    // Increment views for all fetched posts
    await incrementViews(posts);

    return res.status(200).json({ success: true, posts });
  } catch (error) {
    console.error("Error getting posts:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
}

async function incrementViews(posts) {
  const postIds = posts.map((post) => post._id);
  await Post.updateMany({ _id: { $in: postIds } }, { $inc: { views: 1 } });
}

async function getTopPosts(subredditId) {
  return await Post.find({ linkedSubreddit: subredditId }).sort({
    upvotes: -1,
  });
}

async function getNewPosts(subredditId) {
  return await Post.find({ linkedSubreddit: subredditId }).sort({
    createdAt: -1,
  });
}

async function getHotPosts(subredditId) {
  return await Post.find({ linkedSubreddit: subredditId }).sort({ views: -1 });
}

async function getMostCommentedPosts(subredditId) {
  const posts = await Post.find({ linkedSubreddit: subredditId }).populate({
    path: "comments",
    select: "_id",
  });
  posts.forEach((post) => {
    post.numComments = post.comments.length;
  });
  posts.sort((a, b) => b.numComments - a.numComments);
  return posts;
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
async function setSuggestedSort(req, res) {
  try {
    const { suggestedSort } = req.body;
    const subredditName = decodeURIComponent(req.params.subreddit);

    // Find the subreddit by name
    const subreddit = await Subreddit.findOne({ name: subredditName });

    // If subreddit not found, return error
    if (!subreddit) {
      return res
        .status(404)
        .json({ success: false, message: "Subreddit not found" });
    }

    // Set the suggested sort
    subreddit.suggestedSort = suggestedSort;
    await subreddit.save();

    return res
      .status(200)
      .json({ success: true, message: "Suggested sort updated successfully" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
}
/**
 * Get posts from the subreddits that the user is subscribed to.
 * @async
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 * @returns {Object} - The response object containing the posts by subreddit.
 * @throws {Error} - If there is an error fetching the user or posts.
 * @returns {Promise<void>} - A promise that resolves when the operation is complete.
 * @async
 */
async function getUserPosts(req, res) {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = await verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const user = await User.findOne({ _id: decoded.userId }).populate(
      "subreddits"
    );

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const { type } = req.params;

    const fetchPosts = async (subreddit) => {
      switch (type) {
        case "top":
          return Post.find({ linkedSubreddit: subreddit.subreddit })
            .sort({ upvotes: -1 })
            .then((posts) => {
              return posts.map((post) => {
                return {
                  subreddit: subreddit.name,
                  post: post,
                };
              });
            });
        case "new":
          return Post.find({ linkedSubreddit: subreddit.subreddit })
            .sort({ createdAt: -1 })
            .then((posts) => {
              return posts.map((post) => {
                return {
                  subreddit: subreddit.name,
                  post: post,
                };
              });
            });
        default:
          return Promise.reject("Invalid posts type");
      }
    };

    const subredditPosts = await Promise.all(user.subreddits.map(fetchPosts));

    const flattenedPosts = subredditPosts.flat();

    // Increment the views of all fetched posts by 1
    await Promise.all(
      flattenedPosts.map(({ post }) =>
        Post.updateOne({ _id: post._id }, { $inc: { views: 1 } })
      )
    );

    return res.status(200).json({ success: true, posts: flattenedPosts });
  } catch (error) {
    console.error("Error fetching user posts:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
}

module.exports = {
  randomPost,
  getPosts,
  getTopPostsbytime,
  getBestPosts,
  setSuggestedSort,
  getUserPosts,
};
