const Subreddit = require("../../models/subredditModel");
const Post = require("../../models/postModel");
const moment = require("moment");
const { verifyToken } = require("../../utils/tokens");
const User = require("../../models/userModel");
const { filterHiddenPosts } = require("../../utils/posts");
const { decode } = require("jsonwebtoken");
const { getFilesFromS3 } = require("../../utils/s3-bucket");
const { getVoteStatusAndSubredditDetails } = require("../../utils/posts.js");
/**
 * Get a random post from a subreddit.
 * @async
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 * @returns {Object} - The response object containing the random post.
 */

async function randomPost(req, res) {
  // random post linked with the subreddit
  try {
    const decodedURI = decodeURIComponent(req.params.subreddit);
    const subreddit = await Subreddit.findOne({ name: decodedURI });

    if (!subreddit) {
      return res
        .status(404)
        .json({ success: false, message: "Subreddit not found" });
    }

    const posts = await Post.find({ linkedSubreddit: subreddit._id });
    if (posts.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No posts found in the subreddit" });
    }
    //get random post using aggregate
    let randomPost = await Post.aggregate([
      { $match: { linkedSubreddit: subreddit._id } },
      { $sample: { size: 1 } },
    ]);

    if (req.user) {
      const user = await User.findOne({ _id: req.user.userId });
      if (user.hiddenPosts.includes(randomPost[0]._id)) {
        randomPost = await Post.aggregate([
          { $match: { linkedSubreddit: subreddit._id } },
          { $sample: { size: 1 } },
        ]);
      }
    }

    //increase of the number of views
    await Post.updateOne({ _id: randomPost[0]._id }, { $inc: { views: 1 } });
    const media = randomPost.media;
    let userVote = null;
    if (media) {
      randomPost.media = await getFilesFromS3(media);
    }
    let detailsArray;
    if (req.user) {
      const user = await User.findOne({ _id: req.user.userId });
      detailsArray = await getVoteStatusAndSubredditDetails(randomPost, user);
    }

    return res.status(200).json({
      success: true,
      post: randomPost,
      detailsArray: detailsArray && detailsArray,
    });
  } catch (err) {
    console.error("Error getting random post:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

/**
 * Get the top-viewed posts from a subreddit, or a random post if there are no top-viewed posts.
 * @async
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 * @returns {Promise<Object>} - The top-viewed post or a random post.
 */
async function getTopPosts(req, res) {
  try {
    const subredditName = decodeURIComponent(req.params.subreddit);
    const subreddit = await Subreddit.findOne({ name: subredditName });

    if (!subreddit) {
      return res
        .status(404)
        .json({ success: false, message: "Subreddit not found" });
    }

    const topPosts = await Post.find({ linkedSubreddit: subreddit._id }).sort({
      upvotes: -1,
    });

    const media = topPosts.map((post) => post.media);
    if (media) {
      for (let i = 0; i < media.length; i++) {
        topPosts[i].media = await getFilesFromS3(media[i]);
      }
    }

    if (topPosts.length > 0) {
      // Increment views of the first post if top posts exist
      await Post.updateOne({ _id: topPosts[0]._id }, { $inc: { views: 1 } });

      // If user is authenticated, get vote status and subreddit details
      let detailsArray;
      if (req.user) {
        const user = await User.findOne({ _id: req.user.userId });
        detailsArray = await getVoteStatusAndSubredditDetails(topPosts, user);
      }

      return res.status(200).json({
        success: true,
        posts: detailsArray
          ? posts.map((post, index) => ({
              ...post,
              details: detailsArray[index],
            }))
          : posts,
      });
    } else {
      return res
        .status(404)
        .json({ success: false, message: "No top posts found" });
    }
  } catch (error) {
    return res
      .status(400)
      .json({ success: false, message: "Error getting top posts" });
  }
}

/**
 * Get the newest posts from a subreddit.
 * @async
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 * @returns {Promise<Object>} - The newest posts.
 */

async function newPosts(req, res) {
  try {
    const subredditName = decodeURIComponent(req.params.subreddit);
    const subreddit = await Subreddit.findOne({ name: subredditName });
    if (!subreddit) {
      return res
        .status(404)
        .json({ success: false, message: "Subreddit not found" });
    }

    const posts = await Post.find({ linkedSubreddit: subreddit._id }).sort({
      createdAt: -1,
    });
    const media = posts.map((post) => post.media);
    if (media) {
      for (let i = 0; i < media.length; i++) {
        posts[i].media = await getFilesFromS3(media[i]);
      }
    }
    const postIds = posts.map((post) => post._id);
    await Post.updateMany({ _id: { $in: postIds } }, { $inc: { views: 1 } });

    return res.status(200).json({ success: true, posts });
  } catch (error) {
    return res
      .status(400)
      .json({ success: false, message: "Error getting new posts" });
  }
}

/**
 * Get the hot posts from a subreddit.
 * @async
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 * @returns {Promise<Object>} - The hot posts.
 */

async function hotPosts(req, res) {
  try {
    const subredditName = decodeURIComponent(req.params.subreddit);
    const subreddit = await Subreddit.findOne({ name: subredditName });
    if (!subreddit) {
      return res
        .status(404)
        .json({ success: false, message: "Subreddit not found" });
    }

    const posts = await Post.find({ linkedSubreddit: subreddit._id }).sort({
      views: -1,
    });
    const media = Posts.map((post) => post.media);
    if (media) {
      for (let i = 0; i < media.length; i++) {
        Posts[i].media = await getFilesFromS3(media[i]);
      }
    }
    const postIds = posts.map((post) => post._id);
    await Post.updateMany({ _id: { $in: postIds } }, { $inc: { views: 1 } });

    return res.status(200).json({ success: true, posts });
  } catch (error) {
    return res
      .status(400)
      .json({ success: false, message: "Error getting hot posts" });
  }
}

/**
 * Get the posts with the most comments from a subreddit.
 * @async
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 * @returns {Promise<Object>} - The posts with the most comments.
 */

async function mostComments(req, res) {
  try {
    const subredditName = decodeURIComponent(req.params.subreddit);
    const subreddit = await Subreddit.findOne({ name: subredditName });

    if (!subreddit) {
      return res
        .status(404)
        .json({ success: false, message: "Subreddit not found" });
    }

    const posts = await Post.find({ linkedSubreddit: subreddit._id }).populate({
      path: "comments",
      select: "_id",
    });
    posts.forEach((post) => {
      post.numComments = post.comments.length; // Number of comments is the length of the comments array
    });

    posts.sort((a, b) => b.numComments - a.numComments);
    const media = posts.map((post) => post.media);
    if (media) {
      for (let i = 0; i < media.length; i++) {
        posts[i].media = await getFilesFromS3(media[i]);
      }
    }
    return res.status(200).json({ success: true, posts });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Error getting posts with most comments",
    });
  }
}

/**
 * Get the top-viewed posts from a subreddit, by an interval time
 * @async
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 * @returns {Promise<Object>} - The top-viewed post
 */
async function getTopPostsbytime(req, res) {
  try {
    const subredditName = decodeURIComponent(req.params.subreddit);
    const subreddit = await Subreddit.findOne({ name: subredditName });

    if (!subreddit) {
      return res
        .status(404)
        .json({ success: false, message: "Subreddit not found" });
    }

    let timeThreshold;
    if (req.params.time === "new") {
      timeThreshold = moment().subtract(2, "hours").toDate();
    } else {
      timeThreshold = moment()
        .subtract(req.params.timeThreshold, "days")
        .toDate();
    }

    const topPosts = await Post.find({
      linkedSubreddit: subreddit._id,
      createdAt: { $gte: timeThreshold },
    }).sort({ upvotes: -1 });

    const media = topPosts.map((post) => post.media);
    if (media) {
      for (let i = 0; i < media.length; i++) {
        topPosts[i].media = await getFilesFromS3(media[i]);
      }
    }

    if (topPosts.length > 0) {
      await Post.updateOne({ _id: topPosts[0]._id }, { $inc: { views: 1 } });

      let detailsArray;
      if (req.user) {
        const user = await User.findOne({ _id: req.user.userId });
        detailsArray = await getVoteStatusAndSubredditDetails(topPosts, user);
      }

      return res.status(200).json({
        success: true,
        posts: detailsArray
          ? topPosts.map((post, index) => ({
              ...post,
              details: detailsArray[index],
            }))
          : topPosts,
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "No top posts found within the specified time",
      });
    }
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Error getting top posts",
    });
  }
}
/**
 * Sorts posts based on the proportion of upvotes to downvotes.
 * @async
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 * @returns {Promise<void>} - A promise that resolves when the operation is complete.
 */
// async function getBestPosts(req, res) {
//   try {
//     // Fetch all posts from the database
//     const posts = await Post.find({});

//     if (posts.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: "No posts found in the database",
//       });
//     }
//     const sortedPosts = await Post.aggregate([
//       {
//         $addFields: {
//           karma: {
//             $cond: {
//               if: { $gt: ["$upvotes", "$downvotes"] },
//               then: {
//                 $divide: [
//                   { $subtract: ["$upvotes", "$downvotes"] },
//                   { $add: ["$upvotes", "$downvotes"] },
//                 ],
//               },
//               else: 0,
//             },
//           },
//         },
//       },
//       { $sort: { karma: -1 } },
//     ]);

//     res.status(200).json({ success: true, SortedPosts: sortedPosts });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, message: "Internal server error" });
//   }
// }
async function setSuggestedSort(req, res) {
  try {
    const { suggestedSort } = req.body;
    const subredditName = decodeURIComponent(req.params.subreddit);

    // Find the subreddit by name
    const subreddit = await Subreddit.findOne({ name: subredditName });

    // If subreddit not found, return error
    if (!subreddit) {
      return res
        .status(404)
        .json({ success: false, message: "Subreddit not found" });
    }

    // Set the suggested sort
    subreddit.suggestedSort = suggestedSort;
    await subreddit.save();

    return res
      .status(200)
      .json({ success: true, message: "Suggested sort updated successfully" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
}
/**
 * Sorts homepage posts of user subreddits.
 * @async
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 * @returns {Promise<Object>} - The top posts for each subreddit.
 */
async function getUserPosts(req, res) {
  try {
    if (req.user) {
      const user = await User.findOne({ _id: req.user.userId });
      let totalCount;

      const type = req.params.type;
      const timeFrame = req.params.timeframe;
      let page = req.params.query?.page;
      page = page ? parseInt(page) : 1;
      const limit = 10; // Allow 20 items per page
      const skip = (page - 1) * limit;

      const fetchPosts = async (subreddit) => {
        const subredditDetails = await Subreddit.findOne({
          name: subreddit.subreddit,
        });
        if (!subredditDetails) {
          throw new Error("Subreddit details not found");
        }
        totalCount = await Post.countDocuments({
          linkedSubreddit: subredditDetails._id,
        });

        switch (type) {
          case "best":
            // Fetch best posts
            return Post.find({ linkedSubreddit: subredditDetails._id })
              .populate("originalPostId")
              .sort({ upvotes: -1 })
              .skip(skip)
              .limit(limit)
              .then(async (posts) => {
                // Retrieve media files for each post
                for (const post of posts) {
                  if (post.media) {
                    post.media = await getFilesFromS3(post.media);
                  }
                }
                return posts.map((post) => ({
                  subreddit: subreddit.name,
                  post,
                }));
              });

          case "random":
            // Fetch random posts
            return Post.find({ linkedSubreddit: subredditDetails._id })
              .populate("originalPostId")
              .skip(skip)
              .limit(limit)
              .then(async (posts) => {
                // Retrieve media files for each post
                for (const post of posts) {
                  if (post.media) {
                    post.media = await getFilesFromS3(post.media);
                  }
                }
                const randomIndex = Math.floor(Math.random() * posts.length);
                const randomPost = posts[randomIndex];
                return [{ post: randomPost }];
              });

          case "new":
            // Fetch new posts
            return Post.find({ linkedSubreddit: subredditDetails._id })
              .populate("originalPostId")
              .sort({ createdAt: -1 })
              .skip(skip)
              .limit(limit)
              .then(async (posts) => {
                // Retrieve media files for each post
                for (const post of posts) {
                  if (post.media) {
                    post.media = await getFilesFromS3(post.media);
                  }
                }
                return posts.map((post) => ({
                  subreddit: subreddit.name,
                  post,
                }));
              });

          case "top":
            // Fetch top posts
            return Post.find({ linkedSubreddit: subredditDetails._id })
              .populate("originalPostId")
              .sort({ upvotes: -1 })
              .skip(skip)
              .limit(limit)
              .then(async (posts) => {
                // Retrieve media files for each post
                for (const post of posts) {
                  if (post.media) {
                    post.media = await getFilesFromS3(post.media);
                  }
                }
                return posts.map((post) => ({
                  subreddit: subreddit.name,
                  post,
                }));
              });

          case "hot":
            // Fetch hot posts
            return Post.find({ linkedSubreddit: subredditDetails._id })
              .populate("originalPostId")
              .sort({ views: -1 })
              .skip(skip)
              .limit(limit)
              .then(async (posts) => {
                // Retrieve media files for each post
                for (const post of posts) {
                  if (post.media) {
                    post.media = await getFilesFromS3(post.media);
                  }
                }
                return posts.map((post) => ({
                  subreddit: subreddit.name,
                  post,
                }));
              });

          default:
            return Promise.reject("Invalid posts type");
        }
      };

      const subredditPosts = await Promise.all(user.subreddits.map(fetchPosts));

      const flattenedPosts = subredditPosts.flat();

      let fetchedPosts = flattenedPosts;
      if (timeFrame) {
        switch (timeFrame) {
          case "day":
            fetchedPosts = fetchedPosts.filter(
              (post) => post.post.createdAt > Date.now() - 86400000
            );

            break;
          case "week":
            fetchedPosts = fetchedPosts.filter(
              (post) => post.post.createdAt > Date.now() - 604800000
            );
            break;
          case "month":
            fetchedPosts = fetchedPosts.filter(
              (post) => post.post.createdAt > Date.now() - 2628000000
            );
            break;
          case "year":
            fetchedPosts = fetchedPosts.filter(
              (post) => post.post.createdAt > Date.now() - 31540000000
            );
            break;
          case "hour":
            fetchedPosts = fetchedPosts.filter(
              (post) => post.post.createdAt > Date.now() - 3600000
            );
            break;
          case "all":
            // No need to filter
            break;
          default:
            return res.status(400).json({ message: "Invalid time frame" });
        }
      }

      // Get vote status and subreddit details for each post
      const detailsArray = await getVoteStatusAndSubredditDetails(
        flattenedPosts.map(({ post }) => post), // Extracting only the post from each flattened post object
        user
      );

      // Combine posts and their details
      const postsWithDetails = fetchedPosts.map((post, index) => {
        return { ...post, details: detailsArray[index] }; // Use the fetched post directly without calling toObject()
      });

      await Promise.all(
        fetchedPosts.map(({ post }) =>
          Post.updateOne({ _id: post._id }, { $inc: { views: 1 } })
        )
      );

      res.status(200).json({
        totalCount,
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        posts: postsWithDetails,
      });
    } else {
      res.status(401).json({ message: "Unauthorized" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

/**
 * Sort comments for a post within a subreddit based on the specified type.
 * @async
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 * @returns {Promise<Object>} - The sorted comments.
 * @throws {Error} - If an error occurs while sorting the comments.
 * @throws {Error} - If the specified subreddit is not found.
 * @throws {Error} - If the specified post is not found in the subreddit.
 * @throws {Error} - If the specified comment type is invalid.
 * @throws {Error} - If an error occurs while fetching the comments.
 * @throws {Error} - If an error occurs while sorting the comments.
 * @throws {Error} - If an error occurs while fetching the post.
 * @throws {Error} - If an error occurs while sorting the comments.

 */
async function sortComments(req, res) {
  const subredditName = decodeURIComponent(req.params.subreddit);
  const subreddit = await Subreddit.findOne({ name: subredditName });
  if (!subreddit) {
    return res
      .status(404)
      .json({ success: false, message: "Subreddit not found" });
  }

  const postID = decodeURIComponent(req.params.postID);
  const post = await Post.findOne({
    _id: postID,
    linkedSubreddit: subreddit._id,
  });
  if (!post) {
    return res.status(404).json({
      success: false,
      message: "Post not found in the specified subreddit",
    });
  }

  let comments;
  switch (req.params.type) {
    case "top":
      comments = await getTopComments(subreddit._id, post._id);
      break;
    case "new":
      comments = await getNewComments(subreddit._id, post._id);
      break;
    case "best":
      comments = await getBestComments(subreddit._id, post._id);
      break;
    default:
      return res
        .status(400)
        .json({ success: false, message: "Invalid comment type" });
  }

  return res.status(200).json({ success: true, comments });
}

/**
 * Get the top comments for a post within a subreddit.
 * @param {mongoose.Types.ObjectId} subredditId - The ID of the subreddit.
 * @param {mongoose.Types.ObjectId} postId - The ID of the post.
 * @returns {Array} - The top comments for the post.
 */
async function getTopComments(subredditId, postId) {
  try {
    // Fetch the post
    const post = await Post.findOne({
      _id: postId,
      linkedSubreddit: subredditId,
    }).populate("comments");

    if (!post) {
      return [];
    }

    // Sort comments by upvotes in descending order
    return post.comments.sort((a, b) => b.upvotes - a.upvotes);
  } catch (error) {
    console.error("Error getting top comments:", error);
    return [];
  }
}

/**
 * Get the newest comments for a post within a subreddit.
 * @param {mongoose.Types.ObjectId} subredditId - The ID of the subreddit.
 * @param {mongoose.Types.ObjectId} postId - The ID of the post.
 * @returns {Array} - The newest comments for the post.
 */
async function getNewComments(subredditId, postId) {
  try {
    // Fetch the post
    const post = await Post.findOne({
      _id: postId,
      linkedSubreddit: subredditId,
    }).populate("comments");

    if (!post) {
      return [];
    }

    // Sort comments by createdAt in descending order (newest first)
    return post.comments.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  } catch (error) {
    console.error("Error getting new comments:", error);
    return [];
  }
}

/**
 * Get the best comments for a post within a subreddit.
 * @param {mongoose.Types.ObjectId} subredditId - The ID of the subreddit.
 * @param {mongoose.Types.ObjectId} postId - The ID of the post.
 * @returns {Array} - The best comments for the post.
 */
async function getBestComments(subredditId, postId) {
  try {
    // Fetch the post
    const post = await Post.findOne({
      _id: postId,
      linkedSubreddit: subredditId,
    }).populate("comments");

    if (!post) {
      return [];
    }

    // Sort comments based on the proportion of upvotes to downvotes
    return post.comments.sort((a, b) => {
      const karmaA = a.upvotes - a.downvotes;
      const karmaB = b.upvotes - b.downvotes;
      const proportionA = karmaA > 0 ? karmaA / (karmaA + a.downvotes) : 0;
      const proportionB = karmaB > 0 ? karmaB / (karmaB + b.downvotes) : 0;
      return proportionB - proportionA;
    });
  } catch (error) {
    console.error("Error getting best comments:", error);
    return [];
  }
}

/**
 * Sorts allpage posts.
 * @async
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 * @returns {Promise<Object>} - The top posts for each subreddit.
 */
async function guestHomePage(req, res) {
  try {
    const type = req.params.type;
    const timeFrame = req.params.timeframe;
    let page = req.params.query?.page;
    page = page ? parseInt(page) : 1;
    const limit = 10; // Allow 10 items per page
    const skip = (page - 1) * limit;

    const fetchPosts = async () => {
      switch (type) {
        case "best":
          // Fetch best posts
          return Post.find()
            .populate("originalPostId")
            .sort({ upvotes: -1, views: -1, comments: -1 })
            .skip(skip)
            .limit(limit)
            .then(async (posts) => {
              // Retrieve media files for each post
              for (const post of posts) {
                if (post.media) {
                  post.media = await getFilesFromS3(post.media);
                }
              }
              return posts.map((post) => ({ post }));
            });
        case "random":
          // Fetch random posts
          return Post.find()
            .populate("originalPostId")
            .skip(skip)
            .limit(limit)
            .then(async (posts) => {
              // Retrieve media files for each post
              for (const post of posts) {
                if (post.media) {
                  post.media = await getFilesFromS3(post.media);
                }
              }
              return posts.map((randomPost) => ({ post: randomPost }));
            });
        case "top":
          // Fetch top posts
          return Post.find()
            .populate("originalPostId")
            .sort({ upvotes: -1 })
            .skip(skip)
            .limit(limit)
            .then(async (posts) => {
              // Retrieve media files for each post
              for (const post of posts) {
                if (post.media) {
                  post.media = await getFilesFromS3(post.media);
                }
              }
              return posts.map((post) => ({ post }));
            });
        case "new":
          // Fetch new posts
          return Post.find()
            .populate("originalPostId")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .then(async (posts) => {
              // Retrieve media files for each post
              for (const post of posts) {
                if (post.media) {
                  post.media = await getFilesFromS3(post.media);
                }
              }
              return posts.map((post) => ({ post }));
            });
        case "hot":
          // Fetch hot posts
          return Post.find()
            .populate("originalPostId")
            .sort({ views: -1 })
            .skip(skip)
            .limit(limit)
            .then(async (posts) => {
              // Retrieve media files for each post
              for (const post of posts) {
                if (post.media) {
                  post.media = await getFilesFromS3(post.media);
                }
              }
              return posts.map((post) => ({ post }));
            });
        default:
          return Promise.reject("Invalid posts type");
      }
    };

    let fetchedPosts = await fetchPosts();

    if (timeFrame) {
      switch (timeFrame) {
        case "day":
          fetchedPosts = fetchedPosts.filter(
            (post) => post.post.createdAt > Date.now() - 86400000
          );
          break;
        case "week":
          fetchedPosts = fetchedPosts.filter(
            (post) => post.post.createdAt > Date.now() - 604800000
          );
          break;
        case "month":
          fetchedPosts = fetchedPosts.filter(
            (post) => post.post.createdAt > Date.now() - 2628000000
          );
          break;
        case "year":
          fetchedPosts = fetchedPosts.filter(
            (post) => post.post.createdAt > Date.now() - 31540000000
          );
          break;
        case "hour":
          fetchedPosts = fetchedPosts.filter(
            (post) => post.post.createdAt > Date.now() - 3600000
          );
          break;
        case "all":
          // No need to filter
          break;
        default:
          return res.status(400).json({ message: "Invalid time frame" });
      }
    }

    const totalCount = await Post.countDocuments();
    if (req.user) {
      const user = await User.findOne({ _id: req.user.userId });
      const detailsArray = await getVoteStatusAndSubredditDetails(
        fetchedPosts.map(({ post }) => post),
        user
      );

      const postsWithDetails = fetchedPosts.map((post, index) => {
        return { ...post, details: detailsArray[index] };
      });
      return res.status(200).json({
        success: true,
        totalPosts: totalCount,
        posts: postsWithDetails,
      });
    } else {
      return res.status(200).json({
        success: true,
        totalPosts: totalCount,
        posts: fetchedPosts,
      });
    }
  } catch (error) {
    console.error("Error fetching user posts:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
}

module.exports = {
  randomPost,
  getTopPosts,
  newPosts,
  hotPosts,
  mostComments,
  getTopPostsbytime,
  setSuggestedSort,
  getUserPosts,
  guestHomePage,
  sortComments,
  getTopComments,
};
