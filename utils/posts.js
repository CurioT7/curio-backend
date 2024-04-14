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

module.exports = { filterHiddenPosts };
