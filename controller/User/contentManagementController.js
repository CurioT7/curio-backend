const User = require("../../models/userModel");
const Post = require("../../models/postModel");
require("dotenv").config();
const Comment = require("../../models/commentModel");
const Subreddit = require("../../models/subredditModel");
const { verifyToken, authorizeUser } = require("../../utils/tokens");
const multer = require("multer");
const { s3, sendFileToS3, getFilesFromS3 } = require("../../utils/s3-bucket");
const PutObjectCommand = require("@aws-sdk/client-s3");
const { options } = require("../../router/profileRouter");
const Notification = require("../../models/notificationModel");
const { all } = require("axios");
const { getVoteStatusAndSubredditDetails } = require("../../utils/posts");

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
async function spoilerPost(req, res) {
  const token = req.headers.authorization.split(" ")[1];
  const postId = req.body.idpost;
  const decoded = await verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    // Find the post by ID
    const post = await Post.findOne({ _id: postId, authorID: decoded.userId });
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found or you are not authorized to modify it",
      });
    }
    // Mark the post as a spoiler
    post.isSpoiler = true;
    await post.save();
    return res
      .status(200)
      .json({ success: true, message: "Post marked as spoiler successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
}

async function unspoilerPost(req, res) {
  const token = req.headers.authorization.split(" ")[1];
  const postId = req.body.idpost; // Assuming the post ID is in the URL as /api/:idpost/unspoiler
  const decoded = await verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    // Find the post by ID
    const post = await Post.findOne({ _id: postId, authorID: decoded.userId });
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found or you are not authorized to modify it",
      });
    }
    // Unmark the post as a spoiler
    post.isSpoiler = false;
    await post.save();
    return res.status(200).json({
      success: true,
      message: "Post unmarked as spoiler successfully",
    });
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
      if (subreddit.privacyMode === "private") {
        if (!subreddit.members.includes(user._id)) {
          return res.status(403).json({
            success: false,
            message: "User is not a member of this subreddit",
          });
        }
      }
    }

    if (req.body.content && req.body.content.startsWith("http")) {
      // Regular expression to match URLs like www.example.com
      const urlPattern =
        /^(https?:\/\/)?(www\.)?[a-zA-Z0-9-]+(\.[a-zA-Z]{2,})(\/\S*)?$/;

      if (!urlPattern.test(req.body.content)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid URL format" });
      }
    }

    const post = new Post({
      title: req.body.title,
      content: req.body.content && req.body.content,
      authorName: user.username,
      isNSFW: req.body.isNSFW,
      isSpoiler: req.body.isSpoiler,
      isOC: req.body.isOC,
      linkedSubreddit: subreddit && subreddit._id,
      media: imageKey,
      sendReplies: req.body.sendReplies,
      options: req.body.options && req.body.options,
      voteLength: req.body.voteLength && req.body.voteLength,
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
      imageKey = await sendFileToS3(req.file);
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
    if (subreddit.privacyMode === "private") {
      throw new Error("Subreddit is private");
    }
  }
  if (!post) {
    throw new Error("Post not found");
  }
  const crossPost = new Post({
    title: crossPostData.title && crossPostData.title,
    authorName: user.username,
    content: post.content,
    isNSFW: crossPostData.isNSFW,
    isSpoiler: crossPostData.isSpoiler,
    isOC: crossPostData.isOC,
    originalPostId: post._id,
    sendReplies: crossPostData.sendReplies,
    linkedSubreddit: subreddit && subreddit._id,
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
  const token = req.headers.authorization.split(" ")[1];
  const decoded = await verifyToken(token);
  const user = await User.findOne({ _id: decoded.userId });
  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  if (req.body.subreddit) {
    const subreddit = await Subreddit.findOne({ name: req.body.subreddit });
    if (!subreddit) {
      return res
        .status(404)
        .json({ success: false, message: "Subreddit not found" });
    }
    if (subreddit.privacyMode === "private") {
      if (!subreddit.members.includes(user._id)) {
        return res.status(403).json({
          success: false,
          message: "User is not a member of this subreddit",
        });
      }
    }
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

/**
 * Locks a post item if the user has the necessary permissions.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Object} The JSON response indicating success or failure.
 */
async function lockItem(req, res) {
  try {
    if (req.user) {
      const user = await User.findOne({ _id: req.user.userId });

      const itemID = req.body.itemID;
      const post = await Post.findById(itemID);

      if (!post) {
        return res
          .status(404)
          .json({ success: false, message: "Post not found" });
      } else {
        // Check if the user is a moderator or creator of the linked subreddit
        const subredditOfPost = await Subreddit.findById(post.linkedSubreddit);
        if (subredditOfPost) {
          const subredditRole = user.subreddits.find(
            (sub) => sub.subreddit === subredditOfPost.name
          );
          if (
            !subredditRole ||
            (subredditRole.role !== "moderator" && subredditRole.role !== "creator")
          ) {
            return res.status(403).json({
              success: false,
              message: "User is not authorized to lock posts in this subreddit",
            });
          }
        } else {
          await Post.findOneAndUpdate(
            { _id: itemID },
            { isLocked: true },
            { new: true }
          );
          return res
            .status(200)
            .json({ success: true, message: "Post locked successfully" });
        }
      }
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
}

/**
 * Unlocks a post item if the user has the necessary permissions.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Object} The JSON response indicating success or failure.
 */
async function unlockItem(req, res) {
  try {
    const itemID = req.body.itemID;
    if (req.user) {
      const user = await User.findOne({ _id: req.user.userId });

      const post = await Post.findById(itemID);
      if (!post) {
        return res
          .status(404)
          .json({ success: false, message: "Post not found" });
      } else {
        // Check if the user is a moderator or creator of the linked subreddit
        const subredditOfPost = await Subreddit.findById(post.linkedSubreddit);
        if (subredditOfPost){
          const subredditRole = user.subreddits.find(
            (sub) => sub.subreddit === subredditOfPost.name
          );
      
          if (
            !subredditRole ||
            (subredditRole.role !== "moderator" && subredditRole.role !== "creator")
          ) {
            return res.status(403).json({
              success: false,
              message: "User is not authorized to unlock posts in this subreddit",
            });
          }
        } else {
          await Post.findOneAndUpdate(
            { _id: itemID },
            { isLocked: false },
            { new: true }
          );
          return res
            .status(200)
            .json({ success: true, message: "Post unlocked successfully" });
        }
      }
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
}

/**
 * Retrieves information about a specific item based on its type.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Object} The JSON response containing the item information.
 */
async function getItemInfo(req, res) {
  try {
    const objectID = req.query.objectID;
    const objectType = req.query.objectType;
    let item;
    let details;

    if (objectType === "post") {
      item = await Post.findOne({ _id: objectID }).populate("originalPostId");
       if (item.media) {
         item.media = await getFilesFromS3(item.media);
       }
      //TODO check why this doesn't work
      // Get vote status and subreddit details for each post
      details = await getVoteStatusAndSubredditDetails(item);
    } else if (objectType === "comment") {
      item = await Comment.findOne({ _id: objectID });
    } else if (objectType === "subreddit") {
      item = await Subreddit.findOne({ _id: objectID });
    }
    if (!item) {
      return res
        .status(404)
        .json({ success: false, message: "Item not found", media: item.media });
    } else {
      return res.status(200).json({ success: true, item, details });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error", error: error });
  }
}

/**
 * Casts a vote on a post or a comment.
 * @async
 * @function castVote
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Object} JSON response indicating success or failure.
 * @throws {Object} Error message and status code if an error occurs.
 */
async function castVote(req, res) {
  try {
    
    const itemID = req.body.itemID;
    const itemName = req.body.itemName;
    const direction = req.body.direction;

    if (req.user) {
      const user = await User.findOne({ _id: req.user.userId });

      let item;
      if (itemName === "post") {
        item = await Post.findOne({ _id: itemID });
      } else if (itemName === "comment") {
        item = await Comment.findOne({ _id: itemID });
      }

      if (!item) {
        return res
          .status(404)
          .json({ success: false, message: "Item not found" });
      }

      if (direction === 0) {
        // Find the existing vote in upvotes
        const existingUpvoteIndex = user.upvotes.findIndex(
          (vote) => vote.itemId.equals(itemID) && vote.itemType === itemName
        );

        if (existingUpvoteIndex !== -1) {
          //If found in upvotes,remove the existing vote from upvotes
          item.upvotes -= 1;
          user.upvotes.splice(existingUpvoteIndex, 1);
        } else {
          // If not found in upvotes, find in downvotes
          const existingDownvoteIndex = user.downvotes.findIndex(
            (vote) => vote.itemId.equals(itemID) && vote.itemType === itemName
          );

          if (existingDownvoteIndex !== -1) {
            // If found in downvotes, remove the existing vote from downvotes
            item.downvotes -= 1;
            user.downvotes.splice(existingDownvoteIndex, 1);
          } else {
            // If direction is 0 and user hasn't voted yet, return success without making any changes
            return res
              .status(200)
              .json({ success: true, message: "No vote to remove" });
          }
        }

        // Notify the author
        const notification = new Notification({
          title: "New Vote",
          message: `Your ${itemName === "post" ? "post" : "comment"} has been ${direction === 1 ? "upvoted" : "downvoted"
            } by ${user.username}.`,
          recipient: item.authorName,
        });

        await notification.save();

        await Promise.all([item.save(), user.save()]);
        return res
          .status(200)
          .json({ success: true, message: "Vote removed successfully" });
      }

      // If direction is not 0 and user has already voted, return error
      const existingVoteIndex =
        user.upvotes.findIndex(
          (vote) => vote.itemId.equals(itemID) && vote.itemType === itemName
        ) !== -1
          ? user.upvotes.findIndex(
            (vote) => vote.itemId.equals(itemID) && vote.itemType === itemName
          )
          : user.downvotes.findIndex(
            (vote) => vote.itemId.equals(itemID) && vote.itemType === itemName
          );
      if (existingVoteIndex !== -1) {
        return res.status(400).json({
          success: false,
          message: "User has already voted on this item",
        });
      }

      // If direction is not 0 and user hasn't voted yet, add the vote to user's upvotes/downvotes and update item's upvotes/downvotes accordingly
      if (direction === 1) {
        item.upvotes += 1;
        user.upvotes.push({ itemId: itemID, itemType: itemName, direction });
      } else if (direction === -1) {
        item.downvotes += 1;
        user.downvotes.push({ itemId: itemID, itemType: itemName, direction });
      }

      await Promise.all([item.save(), user.save()]);
      return res
        .status(200)
        .json({ success: true, message: "Vote casted successfully" });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error", error: error });
  }
}

/**
 * Add a post to the user's browsing history.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Object} JSON response indicating success or failure.
 */
async function addToHistory(req, res) {
  try {
    const postID = req.body.postID;

    if (req.user) {
      const user = await User.findOne({ _id: req.user.userId });

      const post = await Post.findOne({ _id: postID });
      if (!post) {
        return res
          .status(404)
          .json({ success: false, message: "Post not found" });
      }

      // Check if the post is already in the user's recentPosts
      const isAlreadyInHistory = user.recentPosts.some((recentPost) =>
        recentPost.equals(post._id)
      );

      // If the post is not already in the user's recentPosts, add it
      if (!isAlreadyInHistory) {
        // If recentPosts array length is 10, remove the oldest post
        if (user.recentPosts.length >= 10) {
          user.recentPosts.shift();
        }
        user.recentPosts.push(post._id); // Add the new post at the end
        await user.save();
      }

      return res
        .status(200)
        .json({ success: true, message: "Post added to history" });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error", error: error });
  }
}

/**
 * Retrieve the user's browsing history.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Object} JSON response containing the recent posts.
 */
async function getHistory(req, res) {
  try {
    if (req.user) {
      const user = await User.findOne({ _id: req.user.userId });

      // Retrieve post details for all posts in recentPosts
      const recentPostIds = user.recentPosts;
      const recentPostDetails = await Post.find({
        _id: { $in: recentPostIds },
      }).populate("originalPostId");

      for (const post of recentPostDetails) {
        if (post.media) {
          post.media = await getFilesFromS3(post.media);
        }
      }
      // Get vote status and subreddit details for each post
      const detailsArray = await getVoteStatusAndSubredditDetails(
        recentPostDetails
      );

      // Combine posts and their details
      const postsWithDetails = recentPostDetails.map((post, index) => {
        return { ...post.toObject(), details: detailsArray[index] };
      });

      return res
        .status(200)
        .json({ success: true, recentPosts: postsWithDetails });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error", error: error });
  }
}

/*
 * Get overview of a subreddit when creating a post
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Object} JSON response containing the subreddit overview.
 */

async function subredditOverview(req, res) {
  try {
    const query = decodeURIComponent(req.params.subreddit);
    let subreddit = await Subreddit.findOne({ name: query });
    if (!subreddit) {
      return res
        .status(404)
        .json({ success: false, message: "Subreddit not found" });
    }

    if (subreddit.icon) {
      subreddit.icon = await getFilesFromS3(subreddit.icon);
    }

    if (subreddit.banner) {
      subreddit.banner = await getFilesFromS3(subreddit.banner);
    }

    return res.status(200).json({
      success: true,
      subreddit: subreddit.name,
      allowImages: subreddit.allowImages,
      allowVideos: subreddit.allowVideos,
      allowText: subreddit.allowText,
      allowLink: subreddit.allowLink,
      allowPolls: subreddit.allowPolls,
      allowEmoji: subreddit.allowEmoji,
      allowGif: subreddit.allowGif,
      icon: subreddit.icon,
      banner: subreddit.banner,
      description: subreddit.description,
      rules: subreddit.rules,
      members: subreddit.members.length,
      createdAt: subreddit.createdAt,
      privacyMode: subreddit.privacyMode,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
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
  lockItem,
  unlockItem,
  getItemInfo,
  castVote,
  addToHistory,
  getHistory,
  spoilerPost,
  unspoilerPost,
  subredditOverview,
};
