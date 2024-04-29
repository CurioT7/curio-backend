require("dotenv").config();
const User = require("../../models/userModel");
const Subreddit = require("../../models/subredditModel");
const Post = require("../../models/postModel");
const Comment = require("../../models/commentModel");
const Block = require("../../models/blockModel");
const { verifyToken } = require("../../utils/tokens");

/**
 * Search for users, subreddits, and posts.
 * @async
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 * @returns {Promise<Object>} - The search results.
 */
async function search(req, res) {
  try {
    const { query } = req.params;
    const users = await User.find({
      username: { $regex: query, $options: "i" },
    });
    const subreddits = await Subreddit.find({
      name: { $regex: query, $options: "i" },
    });
    const posts = await Post.find({ title: { $regex: query, $options: "i" } });

    if (posts.length === 0) {
      return res
        .status(404)
        .json({ message: "No posts found for the given query" });
    }

    const postIds = posts.map((post) => post._id);
    await Post.updateMany(
      { _id: { $in: postIds } },
      { $inc: { searchCount: 1 } }
    );

    res.status(200).json({
      users,
      subreddits,
      posts,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
}

/**
 * Get the trending searches.
 * @async
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 * @returns {Promise<Object>} - The trending searches.
 */

async function trendingSearches(req, res) {
  try {
    const posts = await Post.find()
      .sort({ searchCount: -1, createdAt: -1 })
      .limit(5)
      .populate("linkedSubreddit", "name");
    res.status(200).json({
      success: true,
      posts,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
}

/**
 * Get search suggestions for users and subreddits.
 * @async
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 * @returns {Promise<Object>} - The search suggestions.
 * @throws {Error} - If there is an error getting the search suggestions.
 * @returns {Promise<Object>} - The search suggestions.
 */

async function searchSuggestions(req, res) {
  try {
    //get query and convert to string
    const query = decodeURIComponent(req.params.query).toString();

    //get users usernames
    const users = await User.find({
      username: { $regex: query, $options: "i" },
    })
      .select("username profilePicture karma")
      .limit(5);

    const subreddits = await Subreddit.aggregate([
      {
        $match: { name: { $regex: query, $options: "i" } },
      },
      {
        $project: {
          name: 1,
          icon: 1,
          members: { $size: "$members" },
        },
      },
      {
        $limit: 5,
      },
    ]);
    res.status(200).json({
      success: true,
      users,
      subreddits,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}

/**
 * Increment the search count of a post.
 * @async
 * @param {Object} post - The post object.
 * @throws {Error} - If there is an error incrementing the search count.
 * @returns {Promise<void>} - The search count of the post.
 */
async function incSearchCount(post) {
  try {
    await Post.updateMany({ _id: post._id }, { $inc: { searchCount: 1 } });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
}

/**
 * Authorize a user based on a token.
 * @async
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 * @returns {Promise<Object>} - The user object.
 */
// async function authorize(req, res) {
//   try {
//     const token = req.headers.authorization.split(" ")[1];
//     const decoded = await verifyToken(token);
//     if (!decoded) {
//       return res.status(401).json({ message: "Unauthorized" });
//     }
//     const user = await User.findOne({ _id: decoded.userId });
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }
//     return user;
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// }

/**
 * Search for comments or posts based on a query and type.
 * @async
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 * @returns {Promise<Object>} - The search results.
 * @throws {Error} - If there is an error searching for comments or posts.
 */
async function searchCommentsOrPosts(req, res) {
  try {
    const query = decodeURIComponent(req.params.query);
    const type = req.params.type;
    const sortType = req.params.sortType;
    const timeFrame = req.params.timeFrame;
    const subreddit = decodeURIComponent(req.params.subreddit);

    if (type !== "post" && type !== "comment") {
      return res.status(400).json({ message: "Invalid type parameter" });
    }
    if (typeof query !== "string") {
      return res.status(400).json({ message: "Invalid query parameter" });
    }
    let content = [];

    // Search in homepage if no subreddit
    if (!req.params.subreddit) {
      if (type === "post") {
        switch (sortType) {
          case "relevance":
            content = await Post.find({
              $or: [
                { title: { $regex: query, $options: "i" } },
                { content: { $regex: query, $options: "i" } },
              ],
            });
            break;
          case "new":
            content = await Post.find({
              $or: [
                { title: { $regex: query, $options: "i" } },
                { content: { $regex: query, $options: "i" } },
              ],
            }).sort({ createdAt: -1 });
            break;
          case "top":
            content = await Post.find({
              $or: [
                { title: { $regex: query, $options: "i" } },
                { content: { $regex: query, $options: "i" } },
              ],
            }).sort({ upvotes: -1 });
            break;
          case "hot":
            content = await Post.find({
              $or: [
                { title: { $regex: query, $options: "i" } },
                { content: { $regex: query, $options: "i" } },
              ],
            }).sort({ upvotes: -1, createdAt: -1 });
            break;
          case "comments":
            content = await Post.find({
              $or: [
                { title: { $regex: query, $options: "i" } },
                { content: { $regex: query, $options: "i" } },
              ],
            }).sort({
              comments: -1,
            });
            break;

          default:
            return res.status(400).json({ message: "Invalid sort parameter" });
        }
        switch (timeFrame) {
          case "all":
            break;
          case "day":
            content = content.filter(
              (post) => post.createdAt > Date.now() - 86400000
            );
            break;
          case "week":
            content = content.filter(
              (post) => post.createdAt > Date.now() - 604800000
            );
            break;
          case "month":
            content = content.filter(
              (post) => post.createdAt > Date.now() - 2628000000
            );
            break;
          case "year":
            content = content.filter(
              (post) => post.createdAt > Date.now() - 31540000000
            );
            break;
          case "hour":
            content = content.filter(
              (post) => post.createdAt > Date.now() - 3600000
            );
            break;
          default:
            return res.status(400).json({ message: "Invalid time frame" });
        }
      } else {
        switch (sortType) {
          case "relevance":
            content = await Comment.find({
              content: { $regex: query, $options: "i" },
            });
            break;
          case "new":
            content = await Comment.find({
              content: { $regex: query, $options: "i" },
            }).sort({ createdAt: -1 });
            break;
          case "top":
            content = await Comment.find({
              content: { $regex: query, $options: "i" },
            }).sort({ upvotes: -1 });
            break;
          default:
            return res.status(400).json({ message: "Invalid sort parameter" });
        }
      }

      // Check if user is logged in
      if (req.headers.authorization) {
        // const user = await authorize(req, res);
        const token = req.headers.authorization.split(" ")[1];
        const decoded = await verifyToken(token);
        if (!decoded) {
          return res.status(401).json({ message: "Unauthorized" });
        }
        const user = await User.findOne({ _id: decoded.userId });
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }

        // Filter content based on linked subreddit's privacy mode and user's membership
        content = await Promise.all(
          content.map(async (content) => {
            const linkedSubreddit = await Subreddit.findById(
              content.linkedSubreddit
            );
            if (linkedSubreddit) {
              if (
                linkedSubreddit.privacyMode === "public" ||
                subredditObj.members.some(
                  (member) => member.username === user.username
                )
              ) {
                return content;
              }
            }
            if (!linkedSubreddit) {
              return content;
            }
          })
        );

        content = content.filter((content) => content); // Remove undefined values
        type === "post" && (await incSearchCount(content));
        return res.status(200).json({
          success: true,
          content,
        });
      }
      content = await Promise.all(
        content.map(async (content) => {
          const linkedSubreddit = await Subreddit.findById(
            content.linkedSubreddit
          );
          if (linkedSubreddit) {
            if (linkedSubreddit.privacyMode === "public") {
              return content;
            }
          }
          if (!linkedSubreddit) {
            return content;
          }
        })
      );
      content = content.filter((content) => content); // Remove undefined values
      type === "post" && (await incSearchCount(content));
      return res.status(200).json({
        success: true,
        content,
      });
    }
    //User is searching in a subreddit
    const subredditObj = await Subreddit.findOne({
      name: subreddit,
    });

    if (!subredditObj) {
      return res.status(404).json({ message: "Subreddit not found" });
    }
    if (type === "comment") {
      switch (sortType) {
        case "relevance":
          content = await Comment.find({
            content: { $regex: query, $options: "i" },
            linkedSubreddit: subredditObj._id,
          });
          break;
        case "new":
          content = await Comment.find({
            content: { $regex: query, $options: "i" },
            linkedSubreddit: subredditObj._id,
          }).sort({ createdAt: -1 });
          break;
        case "top":
          content = await Comment.find({
            content: { $regex: query, $options: "i" },
            linkedSubreddit: subredditObj._id,
          }).sort({ upvotes: -1 });
          break;
      }
    } else {
      switch (sortType) {
        case "relevance":
          content = await Post.find({
            $or: [
              { title: { $regex: query, $options: "i" } },
              { content: { $regex: query, $options: "i" } },
            ],
          });
          break;
        case "new":
          content = await Post.find({
            $or: [
              { title: { $regex: query, $options: "i" } },
              { content: { $regex: query, $options: "i" } },
            ],
          }).sort({ createdAt: -1 });
          break;
        case "top":
          content = await Post.find({
            $or: [
              { title: { $regex: query, $options: "i" } },
              { content: { $regex: query, $options: "i" } },
            ],
          }).sort({ upvotes: -1 });
          break;
        case "hot":
          content = await Post.find({
            $or: [
              { title: { $regex: query, $options: "i" } },
              { content: { $regex: query, $options: "i" } },
            ],
          }).sort({ upvotes: -1, createdAt: -1 });
          break;
        case "comments":
          content = await Post.find({
            $or: [
              { title: { $regex: query, $options: "i" } },
              { content: { $regex: query, $options: "i" } },
            ],
          }).sort({
            comments: -1,
          });
          break;

        default:
          return res.status(400).json({ message: "Invalid sort parameter" });
      }
      switch (timeFrame) {
        case "all":
          break;
        case "day":
          content = content.filter(
            (post) => post.createdAt > Date.now() - 86400000
          );
          break;
        case "week":
          content = content.filter(
            (post) => post.createdAt > Date.now() - 604800000
          );
          break;
        case "month":
          content = content.filter(
            (post) => post.createdAt > Date.now() - 2628000000
          );
          break;
        case "year":
          content = content.filter(
            (post) => post.createdAt > Date.now() - 31540000000
          );
          break;
        case "hour":
          content = content.filter(
            (post) => post.createdAt > Date.now() - 3600000
          );
          break;
        default:
          return res.status(400).json({ message: "Invalid time frame" });
      }
    }
    // Check if user is logged in
    if (req.headers.authorization) {
      const token = req.headers.authorization.split(" ")[1];
      const decoded = await verifyToken(token);
      if (!decoded) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const user = await User.findOne({ _id: decoded.userId });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      //return all content in a public subreddit
      if (
        subredditObj.members.some(
          (member) => member.username === user.username
        ) ||
        subredditObj.privacyMode === "public"
      ) {
        type === "post" && (await incSearchCount(content));
        return res.status(200).json({
          success: true,
          content,
        });
      }
    }
    //return all content in a public subreddit
    if (subredditObj && subredditObj.privacyMode === "private") {
      return res.status(400).json({
        success: false,
        messsage: "Subreddit is private",
      });
    }

    if (subredditObj.privacyMode === "public") {
      type === "post" && (await incSearchCount(content));
      return res.status(200).json({
        success: true,
        content,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
}

/**
 * Search for people based on a query.
 * @async
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 * @returns {Promise<Object>} - The search results.
 * @throws {Error} - If there is an error searching for people.
 */

async function searchPeople(req, res) {
  try {
    const query = decodeURIComponent(req.params.query);
    //get usernames, profile pictures, and karma
    let users = await User.find({
      username: { $regex: query, $options: "i" },
    })
      .select("username profilePicture karma")
      .limit(5);

    if (req.user) {
      const LoggedUser = await User.findOne({ _id: req.user.userId });
      if (!LoggedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      if (!LoggedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      //filter out the user from the search results and blocked users
      users = users.filter((user) => user.username !== LoggedUser.username);
      const blockedUsers = await Block.find({
        blockerId: LoggedUser._id,
      }).select("blockedId");
      users = users.filter(
        (user) =>
          !blockedUsers.some(
            (blockedUser) => blockedUser.blockedId === user._id
          )
      );
    }

    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
}

/**
 * Search for communities based on a query.
 * @async
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 * @returns {Promise<Object>} - The search results.
 * @throws {Error} - If there is an error searching for communities.
 */
async function searchCommunities(req, res) {
  try {
    const query = decodeURIComponent(req.params.query);
    const subreddits = await Subreddit.aggregate([
      {
        $match: {
          name: { $regex: query, $options: "i" },
        },
      },
      {
        $project: {
          name: 1,
          icon: 1,
          members: { $size: "$members" },
        },
      },
      {
        $limit: 5,
      },
    ]);

    if (subreddits.length === 0) {
      return res
        .status(404)
        .json({ message: "No subreddits found for the given query" });
    }

    res.status(200).json({
      success: true,
      subreddits,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = {
  search,
  trendingSearches,
  searchCommentsOrPosts,
  searchSuggestions,
  searchPeople,
  searchCommunities,
};
