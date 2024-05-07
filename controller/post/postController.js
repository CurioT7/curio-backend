const Post = require("../../models/postModel");
const User = require("../../models/userModel");
const Comment = require("../../models/commentModel");
const Message = require("../../models/messageModel");
const Subreddit = require("../../models/subredditModel");
const {
  generateToken,
  verifyToken,
  generateTimedToken,
} = require("../../utils/tokens");
require("dotenv").config();
const Notification = require("../../models/notificationModel");
const { getVoteStatusAndSubredditDetails } = require("../../utils/posts");
const schedule = require("node-schedule");
const { DateTime } = require("luxon");

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
      const detailsArray = await getVoteStatusAndSubredditDetails(
        postComments,
        user
      );
      const commentsWithDetails = postComments.map((comment, index) => {
        return { ...comment.toObject(), details: detailsArray[index] };
      });
      return res.status(200).json(commentsWithDetails);
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
        type: "postReply",
        message: comment.content,
        createdAt: new Date(),
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
        scheduledTimezone,
        repeatOption,
        contestMode,
      } = req.body;
      if (!type) {
        return res
          .status(400)
          .json({ success: false, message: "Type is required" });
      }

      if (!["post", "poll", "link"].includes(type)) {
        return res.status(400).json({
          success: false,
          message: "Type must be one of 'post', 'poll', 'link'",
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

      let scheduledTime;
      if (scheduledPublishDate && scheduledTimezone) {
        scheduledTime = DateTime.fromISO(scheduledPublishDate, {
          zone: scheduledTimezone,
        });
        if (!scheduledTime.isValid) {
          return res
            .status(400)
            .json({
              success: false,
              message: "Invalid scheduled date/time or timezone",
            });
        }
        // Convert scheduled time to UTC for scheduling
        scheduledTime = scheduledTime.toUTC();
      }

      const post = new Post({
        title,
        type,
        content,
        authorName: user.username,
        isNSFW,
        isSpoiler,
        isOC,
        linkedSubreddit: subreddit ? subreddit._id : undefined,
        sendReplies,
        options: optionsArray,
        voteLength,
        scheduledPublishDate,
        scheduledTimezone,
        repeatOption,
        contestMode,
        isScheduled: !!scheduledTime,
      });
      await post.save();

      if (scheduledTime) {
        schedule.scheduleJob(scheduledTime.toJSDate(), async () => {
          const postToPublish = await Post.findOneAndUpdate(
            { _id: post._id },
            { isScheduled: false }
          );
          await postToPublish.save();
          console.log(
            `Scheduled post "${
              postToPublish.title
            }" published at ${scheduledTime.toISO()}`
          );
        });
      }

      return res.status(201).json({
        success: true,
        message: " Scheduled Post created successfully",
        post,
        postId: post._id,
      });
    }
  } catch (err) {
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
};
