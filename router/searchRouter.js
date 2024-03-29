const express = require("express");
const router = express.Router();

const searchController = require("../controller/search/searchController");

/**
 * Route to handle GET requests for trending searches.
 * @name GET/trendingSearches
 * @function
 * @memberof module:routes/trendingSearchs
 * @param {string} path - The URL path for the route ("/trendingSearches").
 * @param {function} middleware - The controller function to handle the GET request.
 * @returns {object} Express router instance.
 */

router.get("/trendingSearches", searchController.trendingSearches);

/**
 * Route to handle POST requests for searching.
 * @name GET/search
 * @function
 * @memberof module:routes/searchRouter
 * @param {string} path - The URL path for the route ("/search").
 * @param {function} middleware - The controller function to handle the POST request.
 * @returns {object} Express router instance.
 * 
 */
router.get("/search", searchController.search);

module.exports = router;

