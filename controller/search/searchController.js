require("dotenv").config();
const User = require("../../models/userModel");
const Subreddit = require("../../models/subredditModel");
const Post = require("../../models/postModel");
const Comment = require("../../models/commentModel");
const { verifyToken } = require("../../utils/tokens");

/**
 * Search for users, subreddits, and posts.
 * @async
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 * @returns {Promise<Object>} - The search results.
 */
async function search(req, res) {
  try {
    const { query } = req.params;
    const users = await User.find({
      username: { $regex: query, $options: "i" },
    });
    const subreddits = await Subreddit.find({
      name: { $regex: query, $options: "i" },
    });
    const posts = await Post.find({ title: { $regex: query, $options: "i" } });

    if (posts.length === 0) {
      return res
        .status(404)
        .json({ message: "No posts found for the given query" });
    }

    const postIds = posts.map((post) => post._id);
    await Post.updateMany(
      { _id: { $in: postIds } },
      { $inc: { searchCount: 1 } }
    );

    res.status(200).json({
      users,
      subreddits,
      posts,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
}

/**
 * Get the trending searches.
 * @async
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 * @returns {Promise<Object>} - The trending searches.
 */

async function trendingSearches(req, res) {
  try {
    const posts = await Post.find()
      .sort({ searchCount: -1, createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      posts,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
}

async function authorize(req, res){
  try {
  const token = req.headers.authorization.split(" ")[1];
  const decoded = await verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const user = await User.findOne({ _id: decoded.userId });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  return user;
 } catch (error) {
  console.log(error);
  res.status(500).json({ message: "Internal server error" });
}}

async function searchCommentsOrPosts(req, res) {
  try {
    const query = decodeURIComponent(req.params.query);
    const type = req.params.type;
    const subreddit = decodeURIComponent(req.params.subreddit);

    if (type !== "post" && type !== "comment") {
      return res.status(400).json({ message: "Invalid type parameter" });
    }
    if (typeof query !== "string") {
      return res.status(400).json({ message: "Invalid query parameter" });
    }
    let content = [];

    // Search in homepage if no subreddit
    if (!subreddit) {
      if (type === "post") {
        content = await Comment.find({
          content: { $regex: query, $options: "i" },
        });
      } else {
        content = await Comment.find({
          content: { $regex: query, $options: "i" },
        });
      }

      // Check if user is logged in
      if (req.headers.authorization) {
        const user = await authorize(req, res);

        // Filter content based on linked subreddit's privacy mode and user's membership
        content = await Promise.all(
          content.map(async (content) => {
            const linkedSubreddit = await Subreddit.findById(
              content.linkedSubreddit
            );
            if (linkedSubreddit) {
              if (
                linkedSubreddit.privacyMode === "public" ||
                subredditObj.members.some(
                  (member) => member.username === user.username
                )
              ) {
                return content;
              }
            }
            if (!linkedSubreddit) {
              return content;
            }
          })
        );

        content = content.filter((content) => content); // Remove undefined values
        return res.status(200).json({
          success: true,
          content,
        });
      }
      content = await Promise.all(
        content.map(async (content) => {
          const linkedSubreddit = await Subreddit.findById(
            content.linkedSubreddit
          );
          if (linkedSubreddit) {
            if (linkedSubreddit.privacyMode === "public") {
              return content;
            }
          }
          if (!linkedSubreddit) {
            return content;
          }
        })
      );
      content = content.filter((content) => content); // Remove undefined values
      return res.status(200).json({
        success: true,
        content,
      });
    }
    //User is searching in a subreddit
    const subredditObj = await Subreddit.findOne({
      name: subreddit,
    });

    if (!subredditObj) {
      return res.status(404).json({ message: "Subreddit not found" });
    }
    if ( type === "comment"){
    content = await Comment.find({
      content: { $regex: query, $options: "i" },
      linkedSubreddit: subredditObj._id,
    });
   } else {
    content = await Post.find({
      title: { $regex: query, $options: "i" },
      linkedSubreddit: subredditObj._id,
    });
   }
    // Check if user is logged in
    if (req.headers.authorization) {
      const user = await authorize(req, res);
      //return all content in a public subreddit
      if (
        subredditObj.members.some(
          (member) => member.username === user.username
        ) ||
        subredditObj.privacyMode === "public"
      ) {
        return res.status(200).json({
          success: true,
          content,
        });
      }
    }
    //return all content in a public subreddit
    if (subredditObj && subredditObj.privacyMode === "private") {
      return res.status(400).json({
        success: false,
        messsage: "Subreddit is private",
      });
    }

    if (subredditObj.privacyMode === "public") {
      return res.status(200).json({
        success: true,
        content,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = {
  search,
  trendingSearches,
  searchCommentsOrPosts,
};
