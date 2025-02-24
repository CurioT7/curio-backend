const Post = require("../models/postModel");
const User = require("../models/userModel");
const Subreddit = require("../models/subredditModel");
const Comment = require("../models/commentModel");

/**
 * Filters out hidden & removed posts from the list of posts.
 * @param {Array} posts - The list of posts to filter.
 * @param {Object} user - The user object.
 * @returns {Array} - The list of posts with hidden and removed posts removed.
 */

async function filterHiddenPosts(posts, user) {
  try {
    const hiddenPosts = await user.hiddenPosts;
    // Filter out hidden posts
    posts = await posts.filter((post) => !hiddenPosts.includes(post._id));
    // Filter out removed posts where isRemoved is false
    posts = await posts.filter((post) => !post.isRemoved);
    return posts;
  } catch (err) {
    throw new Error(err);
  }
}

/**
 * Filters out removed comments from the list of comments.
 * @param {Array} comments - The list of comments to filter.
 * @param {Object} user - The user object.
 * @returns {Array} - The list of comments with removed comments removed.
 */
async function filterRemovedComments(comments) {
  try {
    // Filter out removed comments where isRemoved is false
    comments = await comments.filter((comment) => !comment.isRemoved);
    return comments;
  } catch (err) {
    throw new Error(err);
  }
}

/**
 * Retrieves the vote status and subreddit details for a given item.
 * @param {Object} item - The item object containing details to be checked.
 * @param {string} item._id - The ID of the item.
 * @param {string} item.authorName - The username of the author of the item.
 * @returns {Promise<{
 *   voteStatus: string,
 *   isUserMemberOfSubreddit: boolean,
 *   subredditName: string|null
 * }>} An object containing the vote status, membership status in the subreddit, and the subreddit name.
 */
async function getVoteStatusAndSubredditDetails(items, user) {
  // Convert single item to array if it's not already an array
  if (!Array.isArray(items)) {
    items = [items];
  }

  const detailsArray = [];

  for (const item of items) {
    let itemData;
    let voteStatus = "unvoted";
    let isUserMemberOfItemSubreddit = false;
    let subredditName = null;
    let pollVote = null;
    let pollEnded = false;

    // Find item data by its ID (assuming it can be either a Post or a Comment)
    itemData =
      (await Post.findById(item._id)) || (await Comment.findById(item._id));
    if (!itemData) {
      throw new Error("Item data not found");
    }

    if (!user) {
      throw new Error("User not found");
    }

    const subreddit = await Subreddit.findById(itemData.linkedSubreddit);
    subredditName = subreddit ? subreddit.name : null;

    // Check if user's subreddit ID matches linkedSubreddit ID
    if (
      user.member.some(
        (member) => member.subreddit.toString() === subredditName
      )
    ) {
      isUserMemberOfItemSubreddit = true;
    }

    // Check if item ID exists in user's upvotes or downvotes arrays
    const isUpvoted = user.upvotes.some(
      (vote) =>
        vote.itemId.toString() === itemData._id.toString() &&
        (vote.itemType === "post" || vote.itemType === "comment")
    );
    const isDownvoted = user.downvotes.some(
      (vote) =>
        vote.itemId.toString() === itemData._id.toString() &&
        (vote.itemType === "post" || vote.itemType === "comment")
    );

    if (isUpvoted) {
      voteStatus = "upvoted";
    } else if (isDownvoted) {
      voteStatus = "downvoted";
    }

    if (itemData.type === "poll") {
      itemData.options.forEach((option) => {
        if (option.voters.includes(user._id)) {
          pollVote = option.name;
        }
      });
      const currentDate = new Date();
      const postDate = new Date(itemData.createdAt);
      const diffTime = Math.abs(currentDate - postDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays > itemData.voteLength) {
        pollEnded = true;
      }
    }
    
    detailsArray.push({
      voteStatus,
      isUserMemberOfItemSubreddit,
      subredditName,
      pollVote: pollVote && pollVote,
      pollEnded,
    });
  }

  return detailsArray;
}

module.exports = {
  filterHiddenPosts,
  getVoteStatusAndSubredditDetails,
  filterRemovedComments,
};
