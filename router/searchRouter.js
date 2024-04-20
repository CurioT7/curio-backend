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
 * Route to handle GET requests for searching.
 * @name GET/search
 * @function
 * @memberof module:routes/searchRouter
 * @param {string} path - The URL path for the route ("/search").
 * @param {function} middleware - The controller function to handle the POST request.
 * @returns {object} Express router instance.
 *
 */
router.get("/search/:query", searchController.search);


// route to handle GET requests for searching comments and posts.
/**
 * Route to handle GET requests for searching comments and posts.
 * @name GET/searchComments
 * @function
 * @memberof module:routes/searchRouter
 * @param {string} path - The URL path for the route ("/searchComments").
 * @param {function} middleware - The controller function to handle the GET request.
 * @returns {object} Express router instance.
 */
router.get("/searchComments/:query/:type/:subreddit?", searchController.searchCommentsOrPosts);

/**
 * Route to handle GET requests for search suggestions.
 * @name GET/searchSuggestions
 * @function
 * @memberof module:routes/searchRouter
 * @param {string} path - The URL path for the route ("/searchSuggestions").
 * @param {function} middleware - The controller function to handle the GET request.
 * @returns {object} Express router instance.
 *
 */

router.get("/searchSuggestions/:query", searchController.searchSuggestions);

module.exports = router;
