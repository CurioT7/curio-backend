const express = require("express");
const router = express.Router();
const ListingController = require("../controller/listing/listingController");
const { authenticate } = require("../middlewares/auth");

/**
 * Route to handle GET requests for getting a random post.
 * @name GET/random_post
 * @function
 * @memberof module:routes/listingRouter
 * @param {string} path - The URL path for the route ("/random_post").
 * @param {function} middleware - The controller function to handle the GET request.
 * @returns {object} Express router instance.
 */

router.get(
  "/r/:subreddit/random",
  (req, res, next) => {
    authenticate(req, res, next, true);
  },
  ListingController.randomPost
);

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

router.get("/r/:subreddit/most_comments", ListingController.mostComments);

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
 * Express route for getting the new/hot/random/best/top posts for a user.
 * @name GET /new
 * @function
 * @memberof module:routes
 * @param {string} path - The URL path for the route ("/user/:type").
 * @param {function} middleware - The controller function to handle the GET request.
 * @returns {object} Express router instance.
*/
router.get("/homepage/:type", ListingController.getUserPosts);

/**
 * 
 */

router.get("/r/:subreddit/:postID/:type", ListingController.sortComments);


/**
 * Express route for getting the homepage for a guest user.
 * @name GET /homepage
 * @function
 * @memberof module:routes
 * @param {string} path - The URL path for the route ("/homepage").
 * @param {function} middleware - The controller function to handle the GET request.
 * @returns {object} Express router instance.
 */
router.get("/allpage/:type", ListingController.guestHomePage);
module.exports = router;
