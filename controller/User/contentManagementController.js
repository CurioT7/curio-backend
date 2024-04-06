User = require("../../models/userModel");
Post = require("../../models/postModel");
const { verifyToken } = require("../../utils/tokens");

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

async function savedCatergroies(req, res) {
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

    if (!user.saveItem) {
      return res.status(200).json({ success: true, categories: [] });
    }

    return res.status(200).json({ success: true, categories: [user.saveItem] });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
}

module.exports = {
  hidePost,
  unhidePost,
  spoilerPost,
  unspoilerPost,
  savedCatergroies,
};
