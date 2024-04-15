const Post = require("../models/postModel");
const User = require("../models/userModel");

/**
 * Filters out hidden posts from the list of posts.
 * @param {Array} posts - The list of posts to filter.
 * @param {Object} user - The user object.
 * @returns {Array} - The list of posts with hidden posts removed.
 */

async function filterHiddenPosts(posts, user) {
  try {
    const hiddenPosts = await user.hiddenPosts;
    posts = await posts.filter((post) => !hiddenPosts.includes(post._id));
    return posts;
  } catch (err) {
    throw new Error(err);
  }
}

async function checkCrossPosts(posts) {
  try {
    const aggregation = await Post.aggregate([
      {
        $match: {
          _id: { $in: posts.map((post) => post._id) },
        },
      },
      {
        $lookup: {
          from: "posts",
          localField: "originalPostId",
          foreignField: "_id",
          as: "originalPost",
        },
      },
      {
        $project: {
          post: "$$ROOT",
          originalPost: { $arrayElemAt: ["$originalPost", 0] },
        },
      },
      {
        $facet: {
          crossPosts: [
            {
              $match: {
                "post.isCrosspost": true,
                originalPost: { $exists: true, $ne: null },
              },
            },
            {
              $project: {
                crossPost: "$post",
                originalPost: 1,
              },
            },
          ],
          otherPosts: [
            {
              $match: {
                "post.isCrosspost": { $ne: true },
              },
            },
            {
              $project: {
                post: 1,
              },
            },
          ],
        },
      },
    ]);

    // Extract results from aggregation
    const { crossPosts, otherPosts } = aggregation[0];

    // Filter out originalPosts from otherPosts based on crossPosts information
    const originalPostIds = new Set(
      crossPosts.map((item) => item.originalPost._id.toString())
    );
    const normalPosts = otherPosts
      .filter((post) => !originalPostIds.has(post.post._id.toString()))
      .map((item) => item.post);

    return {
      crossPosts: crossPosts.map((cp) => ({
        crossPost: cp.crossPost,
      })),
      normalPosts,
    };
  } catch (error) {
    console.error("Error processing posts:", error);
    throw error;
  }
}








module.exports = { filterHiddenPosts, checkCrossPosts };
