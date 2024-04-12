User = require("../../models/userModel");
Post = require("../../models/postModel");
Comment = require("../../models/commentModel");
Subreddit = require("../../models/subredditModel");
const { verifyToken } = require("../../utils/tokens");
const multer = require("multer");

const upload = multer({ dest: "uploads/" });

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

async function submitPostToProfile(req, res, user) {
  try {
    const post = new Post({
      title: req.body.title,
      content: req.body.content,
      authorName: user.username,
      isNSFW: req.body.isNSFW,
      isSpoiler: req.body.isSpoiler,
      isOC: req.body.isOC,
    });
    await post.save();
    return res
      .status(201)
      .json({ success: true, message: "Post created successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
}

async function submitPostToSubreddit(req, res, user) {
  try {
    const subreddit = await Subreddit.findOne({ name: req.body.subreddit });
    if (!subreddit) {
      return res
        .status(404)
        .json({ success: false, message: "Subreddit not found" });
    }
    const post = new Post({
      title: req.body.title,
      content: req.body.content,
      authorName: user.username,
      isNSFW: req.body.isNSFW,
      isSpoiler: req.body.isSpoiler,
      isOC: req.body.isOC,
      linkedSubreddit: subreddit,
    });
    await post.save();
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

async function submit(req, res) {
  try {
    const token = req.headers.authorization.split(" ")[1];
    //profile or subreddit
    const destination = req.body.destination;
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

    // File upload successful, continue with submitting post
    if (destination === "profile") {
      return await submitPostToProfile(req, res, user);
    } else if (destination === "subreddit") {
      return await submitPostToSubreddit(req, res, user);
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Invalid destination" });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
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
    const itemID = req.body.itemID;
    const item = await Post.findOneAndUpdate(
      { _id: itemID },
      { isLocked: true },
      { new: true }
    );
    if (!item) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    } else {
      // Check if the user is a moderator or creator of the linked subreddit
      const subredditOfPost = await Subreddit.findById(item.linkedSubreddit);

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
      else {
        return res
          .status(200)
          .json({ success: true, message: "Post locked successfully" });
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
    const itemID = req.body.itemID;
    const item = await Post.findOneAndUpdate(
      { _id: itemID },
      { isLocked: false},
      { new: true }
    );
    if (!item) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    } else {
      // Check if the user is a moderator or creator of the linked subreddit
      const subredditOfPost = await Subreddit.findById(item.linkedSubreddit);

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
      } else {
        return res
          .status(200)
          .json({ success: true, message: "Post unlocked successfully" });
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
    const token = req.headers.authorization.split(" ")[1];

    const objectID = req.body.objectID;
    const objectType = req.body.objectType;

    const decoded = await verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const user = await User.findOne({ _id: decoded.userId });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    let item; // Declare item using let to allow reassignment

    if (objectType === "post") {
      item = await Post.findOne({ _id: objectID });
    }
    else if (objectType === "comment") {
      item = await Comment.findOne({ _id: objectID });
    }
    else if (objectType === "subreddit") {
      item = await Subreddit.findOne({ _id: objectID });
    }
    if (!item) {
      return res.status(404).json({ success: false, message: "Item not found" });
    } else {
      return res.status(200).json({ success: true, item });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: "Internal server error", error:error });
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
  lockItem,
  unlockItem,
  getItemInfo,
};
