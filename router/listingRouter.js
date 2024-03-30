const express = require("express");
const router = express.Router();
const ListingController = require("../controller/listing/listingController");

/**
 * Route to handle GET requests for getting a random post.
 * @name GET/random_post
 * @function
 * @memberof module:routes/listingRouter
 * @param {string} path - The URL path for the route ("/random_post").
 * @param {function} middleware - The controller function to handle the GET request.
 * @returns {object} Express router instance.
 */

router.get("/r/:subreddit/random", ListingController.randomPost);

/**
 * Route to handle GET requests for getting the top posts in a subreddit.
 * @name GET/top_posts
 * @function
 * @memberof module:routes/listingRouter
 * @param {string} path - The URL path for the route ("/top_posts").
 * @param {function} middleware - The controller function to handle the GET request.
 * @returns {object} Express router instance
 */

router.get("/r/:subreddit/top", ListingController.getTopPosts);

/**
 * Route to handle GET requests for getting the top posts in a subreddit by time threshold.
 * @name GET/top_posts_by_time
 * @function
 * @memberof module:routes/listingRouter
 * @param {string} path - The URL path for the route ("/top_posts_by_time").
 * @param {function} middleware - The controller function to handle the GET request.
 * @returns {object} Express router instance
 */

router.get(
  "/r/:subreddit/top/:timeThreshold",
  ListingController.getTopPostsbytime
);
/** 
 * Express route for retrieving the best posts.
 * @name GET /best
 * @function
 * @memberof module:routes
 * @param {string} path - The URL path for the route ("/best").
 * @param {function} middleware - The controller function to handle the GET request.
 * @returns {object} Express router instance.
 */
router.get("/best", ListingController.getBestPosts);

module.exports = router;
