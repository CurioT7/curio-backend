require("dotenv").config();
const Subreddit = require("../../models/subredditModel");
const User = require("../../models/userModel");
const Post = require("../../models/postModel");
const Comment = require("../../models/commentModel"); 
const { getFilesFromS3, sendFileToS3 } = require("../../utils/s3-bucket");


/**
 * Function to update the banner or icon of a subreddit.
 * @name bannerAndAvatar
 * @function
 * @memberof module:controller/community/modToolsController
 * @param {import('express').Request} req - The request object.
 * @param {import('express').Response} res - The response object.
 */


async function bannerAndAvatar(req, res) {
  try {
    if (req.user) {
      const user = await User.findOne({ _id: req.user.userId });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const subredditName = decodeURIComponent(req.params.subreddit);
      const subreddit = await Subreddit.findOne({ name: subredditName });
      if (!subreddit) {
        return res.status(404).json({ message: "Subreddit not found" });
      }
      const isModerator = subreddit.moderators.some(
        (moderator) => moderator.username === user.username
      );

      if (!isModerator) {
        return res.status(403).json({ message: "You are not authorized to update the banner or icon of this subreddit" });
      }


      let imageKey;
      if (req.file) {
        imageKey = await sendFileToS3(req.file);
        if (!imageKey) {
          return res.status(500).json({ message: "Error uploading image" });
        }
        if (req.body.icon == "Update") {
          req.body.icon = imageKey;
        }
        if (req.body.banner == "Update") {
          req.body.banner = imageKey;
        }
      }
      if (req.body.icon === "Delete") {
        req.body.icon = null;
      }
      if (req.body.banner === "Delete") {
        req.body.banner = null;
      }
      const subredditUpdateFields = {};
      const subredditFields = ["icon", "banner"];
      Object.keys(req.body).forEach((field) => {
        if (subredditFields.includes(field)) {
          subredditUpdateFields[field] = req.body[field];
        }
      });
      const updatedSubreddit = await Subreddit.findOneAndUpdate(
        { name: subredditName },
        subredditUpdateFields,
        { new: true, upsert: true }
      );
      if (!updatedSubreddit) {
        return res.status(404).json({ message: "Subreddit not found" });
      }
      await updatedSubreddit.save();


      let icon;
      let banner;

      if (updatedSubreddit.icon) {
        icon = await getFilesFromS3(updatedSubreddit.icon);
        updatedSubreddit.icon = icon;
      }
      if (updatedSubreddit.banner) {
        banner = await getFilesFromS3(updatedSubreddit.banner);
        updatedSubreddit.banner = banner;
      }
      if (!updatedSubreddit.icon && req.body.icon === "Add") {
        updatedSubreddit.icon = imageKey;
      }

      if (!updatedSubreddit.banner && req.body.banner === "Add") {
        updatedSubreddit.banner = imageKey;
      }

      res.json({ updatedSubreddit, message: " icon/banner updated successfully" });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: "server error" });
  }
}

async function editedQueues(req, res) {
  try {
    if (req.user) {
      const user = await User.findOne({ _id: req.user.userId });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const subredditName = decodeURIComponent(req.params.subreddit);
      const subreddit = await Subreddit.findOne({ name: subredditName });
      if (!subreddit) {
        return res.status(404).json({ message: "Subreddit not found" });
      }

      const isModerator = subreddit.moderators.some(
        (moderator) => moderator.username === user.username
      );
      if (!isModerator) {
        return res.status(403).json({ message: "You are not authorized to see the edited queues of this subreddit" });
      }

      const type = req.params.type;
      const sort = req.params.sort;

      if (type !== "post" && type !== "comment" && type !== "all") {
        return res.status(400).json({ message: "Invalid type parameter" });
      }
      if (sort !== "new" && sort !== "old") {
        return res.status(400).json({ message: "Invalid sort parameter" });
      }

      let responseData = {};

      if (type === "all" && sort === "new") {
        const posts = await Post.find({ linkedSubreddit: subreddit._id, isEdited: true });
        const comments = await Comment.find({ linkedSubreddit: subreddit._id, isEdited: true });
        posts.sort((a, b) => b.createdAt - a.createdAt);
        comments.sort((a, b) => b.createdAt - a.createdAt);
        responseData = { posts, comments };

      } else if (type === "all" && sort === "old") {
        const posts = await Post.find({ linkedSubreddit: subreddit._id, isEdited: true });
        const comments = await Comment.find({ linkedSubreddit: subreddit._id, isEdited: true });
        posts.sort((a, b) => a.createdAt - b.createdAt);
        comments.sort((a, b) => a.createdAt - b.createdAt);
        responseData = { posts, comments };

      } else if (type === "post" && sort === "new") {
        const posts = await Post.find({ linkedSubreddit: subreddit._id, isEdited: true });
        posts.sort((a, b) => b.createdAt - a.createdAt);
        responseData = { posts };

      } else if (type === "post" && sort === "old") {
        const posts = await Post.find({ linkedSubreddit: subreddit._id, isEdited: true });
        posts.sort((a, b) => a.createdAt - b.createdAt);
        responseData = { posts };

      } else if (type === "comment" && sort === "new") {
        const comments = await Comment.find({ linkedSubreddit: subreddit._id, isEdited: true });
        comments.sort((a, b) => b.createdAt - a.createdAt);
        responseData = { comments };
        
      }
      else if (type === "comment" && sort === "old") {
        const comments = await Comment.find({ linkedSubreddit: subreddit._id, isEdited: true });
        comments.sort((a, b) => a.createdAt - b.createdAt);
        responseData = { comments };
      }
      return res.status(200).json({ success: true, data: responseData });
    }
  }
  catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: "server error" });
  }
}
      


module.exports = {
   bannerAndAvatar,
    editedQueues,
   };
