User = require("../../models/userModel");
Post = require("../../models/postModel");
Subreddit = require("../../models/subredditModel");
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

async function submit(req, res) {
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
    //TODO: Compelte the function
    const post = new Post({
      title: req.body.title,
      content: req.body.content,
      authorName: user.username,
      linkedSubreddit: req.body.subredditId,
      isNSFW: req.body.isNSFW,
      isSpoiler: req.body.isSpoiler,
      isOC: req.body.isOC,
      media: req.body.media,
      link: req.body.link,
      isDraft: req.body.isDraft,
    });
    await post.save();
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
}

//TODO handle if shared in subreddit(ex. subreddits.posts.push(postId) or will it be handled in differenct way
//TODO handle if shared in user(ex. user.sharedPosts.push(postId) or will it be handled in differenct way)
async function CreateCrossPost(req, res) {
  const token = req.headers.authorization.split(" ")[1];
  const { title, postId, destination, isSpoiler, isNSFW, sendNotifications } =
    req.body;
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
    const post = await Post.findOne({ _id: req.body.postId });
    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }
    post.shares += 1;
    await post.save();
    //check if destination contains /r or /u
    if (destination.includes("u/")) {
      user.sharedPosts.push(req.body.postId);
      await user.save();
      return res
        .status(200)
        .json({ success: true, message: "Post shared successfully" });
    }
    if (destination.includes("r/")) {
      const linkedSubreddit = await Subreddit.findOne({ name: destination });
      if (!linkedSubreddit) {
        return res
          .status(404)
          .json({ success: false, message: "Subreddit not found" });
      }
      linkedSubreddit.posts.push(req.body.postId);
      await linkedSubreddit.save();
      return res
        .status(200)
        .json({ success: true, message: "Post shared successfully" });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
}

module.exports = { hidePost, unhidePost, CreateCrossPost };
