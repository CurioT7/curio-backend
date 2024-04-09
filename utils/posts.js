const Post = require("../models/postModel");
const User = require("../models/userModel");

async function filterHiddenPosts(posts, user) {
  try {
    const hiddenPosts = user.hiddenPosts;
    return posts.filter((post) => !hiddenPosts.includes(post._id));
  } catch (err) {
    throw new Error(err);
  }
}

module.exports = { filterHiddenPosts };
