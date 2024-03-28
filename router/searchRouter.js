const express = require("express");
const router = express.Router();

const searchController = require("../controller/search/searchController");

/**
 * 
 */
router.get("/trendingSearches", searchController.trendingSearches);

/**
 * 
 */
router.get("/search", searchController.search);

module.exports = router;

