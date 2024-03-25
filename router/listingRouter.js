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
 * Route to handle GET requests for getting top posts.
 * @name GET/top
 * @function
 * @memberof module:routes/listingRouter
 * @param {string} path - The URL path for the route ("/top").
 * @param {function} middleware - The controller function to handle the GET request.
 * @returns {object} Express router instance.
 */
router.get("/r/:subreddit/top", ListingController.getTopPosts);

/**
 * Route to handle GET requests for getting new posts.
 * @name GET/new
 * @function
 * @memberof module:routes/listingRouter
 * @param {string} path - The URL path for the route ("/new").
 * @param {function} middleware - The controller function to handle the GET request.
 * @returns {object} Express router instance.
 */
router.get("/r/:subreddit/new", ListingController.newPosts);

/** 
  * Route to handle GET requests for getting hot posts.
  * @name GET/hot
  * @function
  * @memberof module:routes/listingRouter
  * @param {string} path - The URL path for the route ("/hot").
  * @param {function} middleware - The controller function to handle the GET request.
  * @returns {object} Express router instance.
*/

router.get("/r/:subreddit/hot", ListingController.hotPosts);


/**
 * Route to handle GET requests for getting most commented posts.
 * @name GET/most_commented
 * @function
 * @memberof module:routes/listingRouter
 * @param {string} path - The URL path for the route ("/most_commented").
 * @param {function} middleware - The controller function to handle the GET request.
 * @returns {object} Express router instance.
 */

router.get("/r/:subreddit/mostComments", ListingController.mostComments);

module.exports = router;
