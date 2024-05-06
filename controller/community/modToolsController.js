require("dotenv").config();
const Subreddit = require("../../models/subredditModel");
const User = require("../../models/userModel");
const Post = require("../../models/postModel");
const { getFilesFromS3, sendFileToS3 } = require("../../utils/s3-bucket");


// async function bannerAndAvater(req, res) {
//   let imageKey;
//   if (req.file) {
//     imageKey = await sendFileToS3(req.file);
//     if (!imageKey) {
//       return res.status(500).json({ message: "Error uploading image" });
//     }
//     if (re.body.pro)
//   }


// }

// module.exports = { bannerAndAvater };