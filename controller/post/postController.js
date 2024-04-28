const Post = require("../../models/postModel");
const User = require("../../models/userModel");
const Comment = require("../../models/commentModel");
const {
  generateToken,
  verifyToken,
  generateTimedToken,
} = require("../../utils/tokens");
require("dotenv").config();
const Notification = require("../../models/notificationModel");

// Function to retrieve all comments for a post.
/**
 * Retrieves all comments for a post.
 * @async
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {object} - Express response object
 */
const mongoose = require("mongoose");

async function getPostComments(req, res) {
  try {
    const postId = decodeURIComponent(req.params.postId);

    const post = await Post.findById(postId);

    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found." });
    }

    const postComments = await Comment.find({ linkedPost: post._id });
    return res.status(200).json({ success: true, comments: postComments });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server Error" });
  }
}

// Function to create comments for a post.
/**
 * Creates comments for a post.
 * @async
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {object} - Express response object
 */

async function createComments(req, res) {
  const token = req.headers.authorization.split(" ")[1];
  const decoded = await verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const user = await User.findOne({ _id: decoded.userId });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  try {
    const { postId, content } = req.body;

    const post = await Post.findById(postId);

    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found." });
    }

    // Check if the post is locked
    if (post.isLocked) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Post is locked. Cannot add a comment.",
        });
    }

    // check if user is authorized to comment
    if (post.linkedSubreddit.privacyMode === "private") {
      const isMember = post.linkedSubreddit.members.includes(user._id);
      if (!isMember) {
        return res
          .status(403)
          .json({
            success: false,
            message: "You are not authorized to comment on this post.",
          });
      }
    }

    // Get the username of the post author
    const postAuthor = await User.findById(post.author);

    const comment = new Comment({
      content,
      authorName: user.username,
      createdAt: new Date(),
      upvotes: 0,
      downvotes: 0,
      linkedPost: postId,
      linkedSubreddit: post.linkedSubreddit,
      awards: 0,
    });

    await comment.save();
    post.comments.push(comment._id);
    await post.save();

    // Create a notification for the post author
    const notification = new Notification({
      title: "New Comment",
      message: `${user.username} commented on your post "${post.title}".`, 
      recipient: post.authorName,
      commentId: comment._id,
    });

    await notification.save();
    return res.status(201).json({ success: true, comment });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server Error" });
  }
}

// Function to update(edit) comments for a post.
/**
 * Updates comments for a post.
 * @async
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {object} - Express response object
 */
async function updatePostComments(req, res) {
  const token = req.headers.authorization.split(" ")[1];
  const decoded = await verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const user = await User.findOne({ _id: decoded.userId });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  try {
    const {commentId, content }  = req.body;
    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({ success: false,  message: "comment not found" });
    }

    // check if user is authorized to edit comment
    if (comment.authorName !== user.username) {
      return res.status(403).json({ success: false, message: "You are not authorized to edit this comment." });
    }

    comment.content = content;
    await comment.save();
    return res.status(200).json({ success: true, comment });

  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server Error" });
  }
}

// function to delete comments in a post
/**
 * Deletes comments for a post.
 * @async
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {object} - Express response object
 */

async function deleteComments(req, res) {
  const token = req.headers.authorization.split(" ")[1];
  const decoded = await verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const user = await User.findOne({ _id: decoded.userId });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  try {
    const commentId = decodeURIComponent(req.params.commentId);
    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({ success: false,  message: "comment not found" });
    }

    // Check if the user is the author of the comment
    const isAuthor = comment.authorName === user.username;
    // Check if the user is a moderator of the subreddit
    const isModerator = comment.linkedSubreddit.moderators;

    if (!isAuthor && !isModerator) {
      return res.status(403).json({ success: false, message: "You are not authorized to delete this comment." });
    }

    await Comment.deleteOne({ _id: commentId });
    return res.status(200).json({ success: true, message: "comment deleted successfully" });

  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server Error" });
  }
}

// Function to delete a post
/**
 * Deletes a post.
 * @async
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {object} - Express response object
 */

async function deletePost (req, res) {
  const token = req.headers.authorization.split(" ")[1];
  const decoded = await verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const user = await User.findOne({ _id: decoded.userId });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  try {
    const postId = req.params.postId;
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found." });
    } 
    // Check if the user is the author of the post
    const isAuthor = post.authorName === user.username;
    // Check if the user is a moderator of the subreddit
    const isModerator = post.linkedSubreddit.moderators;

    if (!isAuthor && !isModerator) {
        return res.status(403).json({ success: false, message: "You are not authorized to delete this post." });
    }

    await post.deleteOne();
    return res.status(200).json({ success: true, message: "Post deleted successfully." });
  }
  catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
}

// Function to edit post content
/**
 * Edits post content.
 * @async
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {object} - Express response object
 */

async function editPostContent(req, res) {
  const token = req.headers.authorization.split(" ")[1];
  const decoded = await verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const user = await User.findOne({ _id: decoded.userId });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  try {
    const { postId, content } = req.body;
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found." });
    }
    // check if user is authorized to edit post
    if (post.authorName !== user.username) {
      return res.status(403).json({ success: false, message: "You are not authorized to edit this post." });
    }

    post.content = content;
    await post.save();
    return res.status(200).json({ success: true, post });

  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
}

// Function to mark a post as NSFW
/**
 * Marks a post as NSFW (Not Safe For Work).
 * @async
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {object} - Express response object
 */

// NSFW = Not Safe For Work
async function markPostNSFW(req, res) {
  const token = req.headers.authorization.split(" ")[1];
  const decoded = await verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const user = await User.findOne({ _id: decoded.userId });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  try {
    const { postId } = req.body;
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found." });
    }
    
    post.isNSFW = true;
    await post.save();
    return res.status(200).json({ success: true, post });

  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
}

// Function to unmark a post as NSFW
/**
 * Unmarks a post as NSFW (Not Safe For Work).
 * @async
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {object} - Express response object
 */

async function unmarkPostNSFW(req, res) {
  const token = req.headers.authorization.split(" ")[1];
  const decoded = await verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const user = await User.findOne({ _id: decoded.userId });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  try {
    const { postId } = req.body;
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found." });
    }
    post.isNSFW = false;
    await post.save();
    return res.status(200).json({ success: true, post });

  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
}


module.exports = {
   getPostComments,  
   updatePostComments, 
   createComments,
   deleteComments, 
   deletePost, 
   editPostContent, 
   markPostNSFW, 
   unmarkPostNSFW
  };
