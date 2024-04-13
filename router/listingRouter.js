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
 * Express route for retrieving posts from a subreddit based on the type of posts requested.
 * @name GET /r/:subreddit/:type
 * @function
 * @memberof module:routes
 * @param {string} path - The URL path for the route ("/r/:subreddit/:type").
 * @param {function} middleware - The controller function to handle the GET request.
 * @returns {object} Express router instance.
 */
router.get("/r/:subreddit/:type", ListingController.getPosts);
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
/**
 * Express route for setting the suggested sort of a subreddit.
 * @name POST /r/:subreddit
 * @function
 * @memberof module:routes
 * @param {string} path - The URL path for the route ("/r/:subreddit").
 * @param {function} middleware - The controller function to handle the POST request.
 * @returns {object} Express router instance.
 */
router.post("/r/:subreddit/suggestedSort", ListingController.setSuggestedSort);

/**
 * Route to handle GET requests for getting posts by a specific user.
 * @name GET/user
 * @function
 * @memberof module:routes/listingRouter
 * @param {string} path - The URL path for the route ("/user").
 * @param {function} middleware - The controller function to handle the GET request.
 * @returns {object} Express router instance.
*/
router.get("/user/:type", ListingController.getUserPosts);

module.exports = router;
