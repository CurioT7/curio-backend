const Post = require("../models/postModel");
const User = require("../models/userModel");

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
