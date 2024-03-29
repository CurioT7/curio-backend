const subredditModel = require("../../models/subredditModel");

/**
 * Get random communities from a random category.
 * @async
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 * @returns {Promise<Object>} - The response object containing random communities.
 */
async function getRandomCommunities(req, res) {
  try {
    // Fetch all distinct categories from the database
    const categories = await subredditModel.distinct("category");

    if (categories.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No categories found" });
    }

    const randomCategory =
      categories[Math.floor(Math.random() * categories.length)];

    const communities = await subredditModel.find({ category: randomCategory });

    if (communities.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No communities found in the random category",
      });
    }

    // Select a random subset of communities from the selected category
    const randomCommunities = [];
    const numCommunities = Math.min(5, communities.length); // Limiting to a maximum of 5 random communities
    for (let i = 0; i < numCommunities; i++) {
      const randomIndex = Math.floor(Math.random() * communities.length);
      randomCommunities.push(communities[randomIndex]);
      communities.splice(randomIndex, 1); // Remove selected community to avoid duplicates
    }

    res.status(200).json({
      success: true,
      category: randomCategory,
      communities: randomCommunities,
    });
  } catch (error) {
    console.error("Error getting random communities:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}

module.exports = {
  getRandomCommunities,
};
