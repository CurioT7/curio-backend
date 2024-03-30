require("dotenv").config();
const User = require("../../models/userModel");
const Subreddit = require("../../models/subredditModel");
const Post = require("../../models/postModel");

/**
 * Search for users, subreddits, and posts.
 * @async
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 * @returns {Promise<Object>} - The search results.
 */
async function search(req, res) {
    try {
        const { query } = req.body;
        const users = await User.find({ username: { $regex: query, $options: "i" } });
        const subreddits = await Subreddit.find({ name: { $regex: query, $options: "i" } });
        const posts = await Post.find({ title: { $regex: query, $options: "i" } });

        if (posts.length === 0) {
            return res.status(404).json({ message: "No posts found for the given query" });
        }
        
        for (const post of posts) {
            await Post.updateOne({ _id: post._id }, { $inc: { searchCount: 1 } });
        }

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
        const posts = await Post.find().sort({ searchCount:-1, createdAt: -1 }).limit(5);

        res.status(200).json({
            success: true,
            posts,
        });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
}

module.exports = {
    search,
    trendingSearches,
};

