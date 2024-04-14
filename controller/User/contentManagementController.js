const User = require("../../models/userModel");
const Post = require("../../models/postModel");
require("dotenv").config();
const Comment = require("../../models/commentModel");
const Subreddit = require("../../models/subredditModel");
const { verifyToken, authorizeUser } = require("../../utils/tokens");
const multer = require("multer");
const { s3, sendFileToS3, generateRandomId } = require("../../utils/s3-bucket");
const PutObjectCommand = require("@aws-sdk/client-s3");
const { options } = require("../../router/profileRouter");

/**
 * Hide a post
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - A response object
 * @description Hide a post
 * @throws {Error} - If there is an error hiding the post
 * @async
 */

async function hidePost(req, res) {
  const token = req.headers.authorization.split(" ")[1];
  const postId = req.body.postId;
  const decoded = await verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const user = await User.findOne({ _id: decoded.userId });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    const post = await Post.findOne({ _id: postId });
    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }
    if (user.hiddenPosts.includes(postId)) {
      return res
        .status(400)
        .json({ success: false, message: "Post already hidden" });
    }
    user.hiddenPosts.push(postId);
    await user.save();
    return res
      .status(200)
      .json({ success: true, message: "Post hidden successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
}

/**
 * Unhide a post
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - A response object
 * @description Unhide a post
 * @throws {Error} - If there is an error unhiding the post
 * @async
 */

async function unhidePost(req, res) {
  const token = req.headers.authorization.split(" ")[1];
  const postId = req.body.postId;
  const decoded = await verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const user = await User.findOne({ _id: decoded.userId });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    const post = await Post.findOne({ _id: postId });
    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }
    if (!user.hiddenPosts.includes(postId)) {
      return res
        .status(400)
        .json({ success: false, message: "Post not hidden" });
    }
    await user.hiddenPosts.pull(postId);
    await user.save();
    return res
      .status(200)
      .json({ success: true, message: "Post unhidden successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
}

/**
 * Save a post or comment
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - A response object
 * @description Save a post or comment
 */

async function save(req, res) {
  const token = req.headers.authorization.split(" ")[1];
  const category = req.body.category;
  const id = req.body.id;
  const decoded = await verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const user = await User.findOne({ _id: decoded.userId });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    if (category === "post") {
      if (user.savedItems.includes(id)) {
        return res
          .status(400)
          .json({ success: false, message: "Post already saved" });
      }
      user.savedItems.push(id);
    } else if (category === "comment") {
      if (user.savedItems.includes(id)) {
        return res
          .status(400)
          .json({ success: false, message: "Comment already saved" });
      }
      user.savedItems.push(id);
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Invalid category" });
    }
    await user.save();
    return res
      .status(200)
      .json({ success: true, message: "Saved successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
}

/**
 * unsave a post or comment
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - A response object
 * @description unsave a post or comment
 * @throws {Error} - If there is an error saving the user
 * @async
 */

async function unsave(req, res) {
  const token = req.headers.authorization.split(" ")[1];
  const id = req.body.id;
  const decoded = await verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const user = await User.findOne({ _id: decoded.userId });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    if (!user.savedItems.includes(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Item not saved" });
    }
    await user.savedItems.pull(id);
    await user.save();
    return res
      .status(200)
      .json({ success: true, message: "Unsaved successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
}

/**
 * Get saved posts and comments
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - A response object
 * @description Get saved posts and comments
 * @throws {Error} - If there is an error saving the user
 * @async
 */

async function saved_categories(req, res) {
  const token = req.headers.authorization.split(" ")[1];
  const decoded = await verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const user = await User.findOne({ _id: decoded.userId });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    post = await Post.find({ _id: { $in: user.savedItems } });
    comment = await Comment.find({ _id: { $in: user.savedItems } });
    return res
      .status(200)
      .json({ success: true, savedPosts: post, savedComments: comment });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
}

/**
 * Get hidden posts
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - A response object
 * @description Get hidden posts
 * @throws {Error} - If there is an error saving the user
 * @async
 */
async function hidden(req, res) {
  const token = req.headers.authorization.split(" ")[1];
  const decoded = await verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const user = await User.findOne({ _id: decoded.userId });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    post = await Post.find({ _id: { $in: user.hiddenPosts } });
    return res.status(200).json({ success: true, hiddenPosts: post });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
}

/**
 * Submit a post
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - A response object
 * @description Submit a post
 * @throws {Error} - If there is an error saving the user
 * @async
 */

async function submitPost(req, res, user, imageKey) {
  try {
    let subreddit;
    if (req.body.subreddit) {
      subreddit = await Subreddit.findOne({ name: req.body.subreddit });
      if (!subreddit) {
        return res
          .status(404)
          .json({ success: false, message: "Subreddit not found" });
      }
    }
    const post = new Post({
      title: req.body.title,
      content: req.body.content,
      authorName: user.username,
      isNSFW: req.body.isNSFW,
      isSpoiler: req.body.isSpoiler,
      isOC: req.body.isOC,
      linkedSubreddit: req.body.subreddit ? subreddit._id : null,
      media: imageKey,
      sendReplies: req.body.sendReplies,
      options: req.body.options ? req.body.options : null,
      voteLength: req.body.voteLength ? req.body.voteLength : null,
    });
    await post.save();
    // Add post to user's posts
    user.posts.push(post._id);
    await user.save();
    if (subreddit) {
      subreddit.posts.push(post._id);
      await subreddit.save();
    }
    return res
      .status(201)
      .json({ success: true, message: "Post created successfully" });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
}

/**
 * Submit a post
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - A response object
 * @description Submit a post
 * @throws {Error} - If there is an error saving the user
 * @async
 * @returns {Object} - A response object
 */

async function submit(req, res) {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = await verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const user = await User.findOne({ _id: decoded.userId });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    var imageKey;

    if (req.file) {
      imageKey = await sendFileToS3(req, res);
      if (!imageKey) {
        return res.status(500).json({
          success: false,
          message: "Server Error: Cannot Upload Image",
        });
      }
    }
    return await submitPost(req, res, user, imageKey);
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
}

/**
 * Share a post to profile or subreddit
 * @param {Object} user - User object
 * @param {Object} crossPostData - Crosspost data
 * @param {Object} res - Express response object
 * @returns {Object} - A response object
 * @description Share a post to profile or subreddit
 * @throws {Error} - If there is an error sharing the post
 * @async
 */

async function shareCrossPost(user, crossPostData) {
  if (!user) {
    throw new Error("Unauthorized");
  }
  const post = await Post.findOne({ _id: crossPostData.postId });
  let subreddit;
  if (crossPostData.subreddit) {
    subreddit = await Subreddit.findOne({
      name: crossPostData.subreddit,
    });
    if (!subreddit) {
      throw new Error("Subreddit not found");
    }
  }
  if (!post) {
    throw new Error("Post not found");
  }
  const crossPost = new Post({
    title: crossPostData.title ? crossPostData.title : post.title,
    authorName: user.username,
    content: post.content,
    isNSFW: crossPostData.isNSFW,
    isSpoiler: crossPostData.isSpoiler,
    isOC: crossPostData.isOC,
    originalPostId: post._id,
    sendReplies: crossPostData.sendReplies,
    linkedSubreddit: subreddit ? subreddit._id : null,
  });
  post.shares += 1;
  await post.save();
  await crossPost.save();
  // Add post to user's posts
  user.posts.push(crossPost._id);
  await user.save();
  if (subreddit) {
    subreddit.posts.push(post._id);
    await subreddit.save();
  }
}

/**
 * Share a post to profile or subreddit
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - A response object
 * @description Share a post to profile or subreddit
 * @throws {Error} - If there is an error sharing the post
 * @async
 * @returns {Object} - A response object
 */

async function sharePost(req, res) {
  const user = await authorizeUser(req, res);
  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const crossPostData = req.body;
  try {
    await shareCrossPost(user, crossPostData);
    res
      .status(201)
      .json({ success: true, message: "Post shared successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}

/**
 * Get post link
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - A response object
 * @description Get post link
 * @throws {Error} - If there is an error getting the post link
 * @async
 */

async function getPostLink(req, res) {
  try {
    const postId = decodeURIComponent(req.params.postId);
    const post = await Post.findById(postId);
    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }
    let postLink = `${
      process.env.VITE_FRONTEND_HOST || "http://localhost:5173"
    }/post/${post._id}`;
    return res.status(200).json({ success: true, postLink });
  } catch {
    return res
      .status(500)
      .json({ success: falses, message: "Internal server error" });
  }
}

module.exports = {
  hidePost,
  unhidePost,
  save,
  unsave,
  saved_categories,
  hidden,
  submit,
  sharePost,
  getPostLink,
};
