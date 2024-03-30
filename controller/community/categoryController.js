const Subreddit = require("../../models/subredditModel");

/**
 * Retrieves communities belonging to a specified category.
 * @async
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 * @returns {Promise<void>} - A promise that resolves when the operation is complete.
 */
async function getCommunitiesByCategory(req, res) {
  try {
    const category = req.body.category;

    if (!category) {
      return res
        .status(400)
        .json({ success: false, message: "Category parameter is required" });
    }

    // Query the database to find communities belonging to the specified category
    const communities = await Subreddit.find({ category: category });

    if (communities.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No communities found for the specified category",
      });
    }

    res.status(200).json({ success: true, communities: communities });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}

module.exports = {
  getCommunitiesByCategory,
};
