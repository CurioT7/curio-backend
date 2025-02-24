const Post = require("../../models/postModel");
const User = require("../../models/userModel");
const Comment = require("../../models/commentModel");
const Message = require("../../models/messageModel");
const Subreddit = require("../../models/subredditModel");
const ScheduledPost = require("../../models/scheduledPostModel");
const {
  generateToken,
  verifyToken,
  generateTimedToken,
} = require("../../utils/tokens");
require("dotenv").config();
const Notification = require("../../models/notificationModel");
const {
  getVoteStatusAndSubredditDetails,
  filterRemovedComments,
} = require("../../utils/posts");
const schedule = require("node-schedule");
const { DateTime } = require("luxon");
const moment = require('moment');

// Function to retrieve all comments for a post.
/**
 * Retrieves all comments for a post.
 * @async
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {object} - Express response object
 */
const mongoose = require("mongoose");
const { $Command } = require("@aws-sdk/client-s3");

async function getPostComments(req, res) {
  try {
    const postId = decodeURIComponent(req.params.postId);
    const post = await Post.findById(postId).populate("originalPostId");
    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found." });
    }
    if (req.user) {
      const user = await User.findOne({ _id: req.user.userId });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const postComments = await Comment.find({ linkedPost: post._id });
      const filteredComments=await filterRemovedComments(postComments);
      const detailsArray = await getVoteStatusAndSubredditDetails(
        filteredComments,
        user
      );
      const commentsWithDetails = filteredComments.map((comment, index) => {
        return { ...comment.toObject(), details: detailsArray[index] };
      });
      return res.status(200).json(commentsWithDetails);
    }
    let postComments = await Comment.find({ linkedPost: post._id });
    postComments = await filterRemovedComments(postComments);
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
  try {
    if (req.user) {
      const user = await User.findOne({ _id: req.user.userId });
      const { postId, content } = req.body;

      const post = await Post.findById(postId).populate("originalPostId");

      if (!post) {
        return res
          .status(404)
          .json({ success: false, message: "Post not found." });
      }
    
      // Check if the post is locked
      if (post.isLocked) {
        return res.status(403).json({
          success: false,
          message: "Post is locked. Cannot add a comment.",
        });
      }
      const subreddit = await Subreddit.findById(post.linkedSubreddit);
      const bannedUsernames = subreddit.bannedUsers.map((user) => user.username);

      // Check if the user adding the comment is in the banned users list
      if (bannedUsernames.includes(user.username)) {
        return res.status(403).json({
          success: false,
          message: "User is banned in this subreddit. Cannot add a comment.",
        });
      }

      const mutedUsernames = subreddit.mutedUsers.map((user) => user.username);
      if (mutedUsernames.includes(user.username)) {
        return res.status(403).json({
          success: false,
          message: "User is muted in this subreddit. Cannot add a comment.",
        });
      }
      // Find the author of the post
      const postAuthor = await User.findOne({ username: post.authorName });
      // // Proceed to create the comment
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
      // Check if the post is disabled for the author
      const isPostDisabled =
        postAuthor.notificationSettings.disabledPosts.includes(postId);

      console.log(isPostDisabled);
      console.log(postAuthor.notificationSettings.disabledPosts);
      // Create a notification based on whether the post is disabled for the author
      const notification = new Notification({
        title: isPostDisabled ? "Comment on Disabled Post" : "New Comment",
        message: isPostDisabled
          ? `${user.username} commented on your disabled post "${post.title}".`
          : `${user.username} commented on your post "${post.title}".`,
        recipient: post.authorName,
        type: isPostDisabled ? "Comment" : "Comment",
        commentId: comment._id,
        isDisabled: isPostDisabled,
      });

      await notification.save();
      // Check for mentions in the comment content
      if (comment.content.includes("u/")) {
        const mentionedUsers = comment.content.match(/u\/\w+/g);
        const mentionedUsersNames = mentionedUsers.map((user) =>
          user.slice(2).toString()
        );
        const users = await User.find({
          username: { $in: mentionedUsersNames },
        });
        users.forEach(async (mentionedUser) => {
          const mentionNotification = new Notification({
            title: "Mention",
            message: `${user.username} mentioned you in a comment.`,
            recipient: mentionedUser.username,
            type: "CommentMention",
          });
          const message = new Message({
            sender: user,
            recipient: mentionedUser,
            type: "userMention",
            message: comment.content,
            createdAt: new Date(),
            postId: post._id,
            linkedSubreddit: post.linkedSubreddit,
            commentId: comment._id,
            commentNumber: post.comments.length,
          });
          mentionedUser.mentions.push(message._id);
          await Promise.all([
            mentionNotification.save(),
            message.save(),
            mentionedUser.save(),
          ]);
        });
      }

      const replyMessage = new Message({
        sender: user,
        recipient: postAuthor,
        linkedSubreddict: post.linkedSubreddit,
        postId: post._id,
        commentId: comment._id,
        type: "postReply",
        message: comment.content,
        createdAt: new Date(),
        commentNumber: post.comments.length,
      });
      postAuthor.receivedPrivateMessages.push(replyMessage._id);

      await Promise.all([replyMessage.save(), postAuthor.save()]);
      return res.status(201).json({ success: true, comment });
    }
  } catch (err) {
    console.error(err);
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
  try {
    if (req.user) {
      const user = await User.findOne({ _id: req.user.userId });
      const { commentId, content } = req.body;
      const comment = await Comment.findById(commentId);

      if (!comment) {
        return res
          .status(404)
          .json({ success: false, message: "comment not found" });
      }

      const subreddit = await Subreddit.findById(comment.linkedSubreddit);
      const bannedUsernames = subreddit.bannedUsers.map(
        (user) => user.username
      );

      // Check if the user adding the comment is in the banned users list
      if (bannedUsernames.includes(user.username)) {
        return res.status(403).json({
          success: false,
          message: "User is banned in this subreddit. Cannot add a comment.",
        });
      }

      // check if user is authorized to edit comment
      if (comment.authorName !== user.username) {
        return res.status(403).json({
          success: false,
          message: "You are not authorized to edit this comment.",
        });
      }

      comment.content = content;
      comment.isEdited = true;
      await comment.save();
      return res.status(200).json({ success: true, comment });
    }
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
  try {
    if (req.user) {
      const user = await User.findOne({ _id: req.user.userId });
      const commentId = decodeURIComponent(req.params.commentId);
      const comment = await Comment.findById(commentId);

      if (!comment) {
        return res
          .status(404)
          .json({ success: false, message: "comment not found" });
      }

      // Check if the user is the author of the comment
      const isAuthor = comment.authorName === user.username;

      if (!isAuthor) {
        return res.status(403).json({
          success: false,
          message: "You are not authorized to delete this comment.",
        });
      }

      await Comment.deleteOne({ _id: commentId });

      await Post.updateOne(
        { _id: comment.linkedPost },
        { $pull: { comments: commentId } }
      );

      return res
        .status(200)
        .json({ success: true, message: "comment deleted successfully" });
    }
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

async function deletePost(req, res) {
  try {
    if (req.user) {
      const user = await User.findOne({ _id: req.user.userId });
      const postId = req.params.postId;
      const post = await Post.findById(postId).populate("originalPostId");
      if (!post) {
        return res
          .status(404)
          .json({ success: false, message: "Post not found." });
      }
      // Check if the user is the author of the post
      const isAuthor = post.authorName === user.username;
      if (!isAuthor) {
        return res.status(403).json({
          success: false,
          message: "You are not authorized to delete this post.",
        });
      }

      await post.deleteOne();
      return res
        .status(200)
        .json({ success: true, message: "Post deleted successfully." });
    }
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error." });
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
  try {
    if (req.user) {
      const user = await User.findOne({ _id: req.user.userId });
      const { postId, content } = req.body;
      const post = await Post.findById(postId).populate("originalPostId");
      if (!post) {
        return res
          .status(404)
          .json({ success: false, message: "Post not found." });
      }
      // check if user is authorized to edit post
      if (post.authorName !== user.username) {
        return res.status(403).json({
          success: false,
          message: "You are not authorized to edit this post.",
        });
      }

      post.content = content;
      post.isEdited = true;
      await post.save();

      return res.status(200).json({ success: true, post });
    }
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error." });
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
  try {
    if (req.user) {
      const user = await User.findOne({ _id: req.user.userId });
      const { postId } = req.body;
      const post = await Post.findById(postId).populate("originalPostId");
      if (!post) {
        return res
          .status(404)
          .json({ success: false, message: "Post not found." });
      }

      post.isNSFW = true;
      await post.save();
      return res.status(200).json({ success: true, post });
    }
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error." });
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
  try {
    if (req.user) {
      const user = await User.findOne({ _id: req.user.userId });
      const { postId } = req.body;
      const post = await Post.findById(postId).populate("originalPostId");
      if (!post) {
        return res
          .status(404)
          .json({ success: false, message: "Post not found." });
      }
      post.isNSFW = false;
      await post.save();
      return res.status(200).json({ success: true, post });
    }
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error." });
  }
}

// Function to schedule a post
/**
 * Schedules a post for publishing at a later date and time.
 * @async
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {object} - Express response object
 */

async function scheduledPost(req, res) {
  try {
    if (req.user) {
      const user = await User.findOne({ _id: req.user.userId });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const {
        type,
        title,
        content,
        subreddit,
        isNSFW,
        isSpoiler,
        isOC,
        sendReplies,
        options,
        voteLength,
        scheduledPublishDate,
        repeatOption,
        contestMode,
      } = req.body;
      if (!type) {
        return res
          .status(400)
          .json({ success: false, message: "Type is required" });
      }

      if (!["post","media", "poll", "link"].includes(type)) {
        return res.status(400).json({
          success: false,
          message: "Type must be one of 'post','media', 'poll', 'link'",
        });
      }
      let subredditname;
      if (subreddit) {
        subredditname = await Subreddit.findOne({ name: subreddit });
        if (!subredditname) {
          return res
            .status(404)
            .json({ success: false, message: "Subreddit not found" });
        }
        if (subreddit.privacyMode === "private") {
          const isMember = subreddit.members.some(
            (member) => member.username === user.username
          );
          if (!isMember) {
            return res.status(403).json({
              success: false,
              message: "User is not a member of this subreddit",
            });
          }
        }
      }

      if (content && content.startsWith("http") && type === "link") {
        // Regular expression to match URLs like www.example.com
        const urlPattern =
          /^(https?:\/\/)?(www\.)?[a-zA-Z0-9-]+(\.[a-zA-Z]{2,})(\/\S*)?$/;
        if (!urlPattern.test(req.body.content)) {
          return res
            .status(400)
            .json({ success: false, message: "Invalid URL format" });
        }
      }

      let optionsArray;
      if (type === "poll") {
        optionsArray = options;
        optionsArray = optionsArray
          .split(",")
          .map((option) => ({ name: option, votes: 0 }));
      }

      const scheduledTime = DateTime.fromISO(scheduledPublishDate).toUTC();
      const now = DateTime.utc();
      const timeDiff = scheduledTime.diff(now);

      const mutedUser = await Subreddit.findOne({
        name: req.body.subreddit,
        "mutedUsers.username": user.username,
      });
  
      if (mutedUser) {
        return res.status(403).json({
          success: false,
          message: "You are muted in this subreddit. Cannot submit a post.",
        });
      }
      

      if (timeDiff <= 0) {
        return res.status(400).json({
          success: false,
          message: "Scheduled publish date cannot be in the past",
        });
      }
      const scheduledPost = new ScheduledPost({
        title,
        type,
        content,
        linkedSubreddit: subredditname._id,
        authorName: user.username,
        isNSFW,
        isSpoiler,
        isOC,
        sendReplies,
        options: optionsArray,
        voteLength,
        scheduledPublishDate: scheduledTime,
        timeToPublish: timeDiff,
        repeatOption,
        contestMode,
        isScheduled: true,
      });
      await scheduledPost.save();

      setTimeout(async () => {
        const post = new Post({
          ...scheduledPost,
          title: scheduledPost.title,
          authorName: scheduledPost.authorName,
          
          scheduledPublishDate: scheduledPost.scheduledTime,
          timeToPublish: null,
          isScheduled: false,
        });
        await post.save();
        await ScheduledPost.deleteOne({ _id: scheduledPost._id });
        user.posts.push(post._id);
        if (subredditname) {
          subredditname.posts.push(post._id);
          await subredditname.save();
        }
      }, timeDiff);

      return res.status(201).json({
        success: true,
        message: " Scheduled Post created successfully",
        scheduledPost,
        scheduledPostID: scheduledPost._id,
      });
    }
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error." });
  }
}

/** 
* Function to get scheduled posts
* @async
* @param {object} req - Express request object
* @param {object} res - Express response object
* @returns {object} - Express response object
*/

async function getScheduledPost(req, res) {
  try {
    if (req.user) {
      const subreddit = req.params.subreddit;
      const user = await User.findOne({ _id: req.user.userId });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const scheduledPosts = await ScheduledPost.find({
        authorName: user.username,
      });
      if (subreddit) {
        subredditname = await Subreddit.findOne({ name: subreddit });
        if (!subredditname) {
          return res
            .status(404)
            .json({ success: false, message: "Subreddit not found" });
        }
      }
      if (!scheduledPosts) {
        return res
          .status(404)
          .json({ success: false, message: "No scheduled posts found." });
      }

      return res.status(200).json({ success: true, scheduledPosts });
    }
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error." });
  }
}

/**
 * Function to delete a scheduled post
 * @async
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {object} - Express response object
 */

async function deleteScheduledPost(req, res) {
  try {
    if (req.user) {
      const user = await User.findOne({ _id: req.user.userId });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const scheduledPostId = req.params.postId;
      const scheduledPost = await ScheduledPost.findById(scheduledPostId);
      if (!scheduledPost) {
        return res
          .status(404)
          .json({ success: false, message: "Scheduled post not found or published." });
      }
      if (scheduledPost.authorName !== user.username) {
        return res.status(403).json({
          success: false,
          message: "You are not authorized to delete this scheduled post.",
        });
      }
      await scheduledPost.deleteOne();
      return res
        .status(200)
        .json({ success: true, message: "Scheduled post deleted successfully." });
    }
  }
  catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error." });
  }
}

/**
 * Function to edit a scheduled post
 * @async
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {object} - Express response object
 */

async function editScheduledPost(req, res) {
  try {
    if (req.user) {
      const user = await User.findOne({ _id: req.user.userId });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const { scheduledPostId, content } = req.body; 
      const post = await ScheduledPost.findById(scheduledPostId);
      if (!post) {
        return res
          .status(404)
          .json({ success: false, message: "Scheduled post not found." });
      }
      if (post.authorName !== user.username) {
        return res.status(403).json({
          success: false,
          message: "You are not authorized to edit this scheduled post.",
        });
      }
      post.content = content;
      post.isEdited = true;
      await post.save();
      return res.status(200).json({ success: true, post });
    }
  }
  catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error." });
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
  unmarkPostNSFW,
  scheduledPost,
  getScheduledPost,
  deleteScheduledPost,
  editScheduledPost,
};
