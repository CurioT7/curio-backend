require("dotenv").config();
const Subreddit = require("../../models/subredditModel");
const User = require("../../models/userModel");
const Post = require("../../models/postModel");
const { getFilesFromS3, sendFileToS3 } = require("../../utils/s3-bucket");

async function bannerAndAvatar(req, res) {
  try {
    if (req.user) {
      const user = await User.findOne({ _id: req.user.userId });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const subredditName = decodeURIComponent(req.params.subreddit);

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
      const subreddit = await Subreddit.findOneAndUpdate(
        { name: subredditName },
        subredditUpdateFields,
        { new: true, upsert: true }
      );
      if (!subreddit) {
        return res.status(404).json({ message: "Subreddit not found" });
      }
      await subreddit.save();


      let icon;
      let banner;

      if (subreddit.icon) {
        icon = await getFilesFromS3(subreddit.icon);
        subreddit.icon = icon;
      }
      if (subreddit.banner) {
        banner = await getFilesFromS3(subreddit.banner);
        subreddit.banner = banner;
      }
      if (!subreddit.icon && req.body.icon === "Add") {
        subreddit.icon = imageKey;
      }

      if (!subreddit.banner && req.body.banner === "Add") {
        subreddit.banner = imageKey;
      }

      res.json({ subreddit, message: " icon/banner updated successfully" });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: "server error" });
  }
}

module.exports = { bannerAndAvatar };
