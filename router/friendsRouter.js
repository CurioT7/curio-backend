const express = require("express");
const router = express.Router();
const friendsController = require("../controller/friends/friendController");
const { authenticate } = require("../middlewares/auth");

/**
 * Route to follow a subreddit.
 * @name POST /friend
 * @function
 * @memberof module:routes/friends
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware.
 */
router.post("/friend", friendsController.followSubreddit);

/**
 * Route to unfollow a subreddit.
 * @name POST /unfriend
 * @function
 * @memberof module:routes/friends
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware.
 */
router.post("/unfriend", friendsController.unFollowSubreddit);

/**
 * Route to send a friend request.
 * @name POST /me/friends/:username
 * @function
 * @memberof module:routes/friends
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware.
 */
router.post("/me/friends", friendsController.friendRequest);

/**
 * Route to cancel a friend request.
 * @name PATCH /me/friends/:username
 * @function
 * @memberof module:routes/friends
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware.
 */
router.patch("/me/friends", friendsController.unFriendRequest);

/**
 * Route to get user information.
 * @name GET /me/friends/:username
 * @function
 * @memberof module:routes/friends
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware.
 */
router.get("/me/friends/:friendUsername", friendsController.getUserInfo);

/**
 * Route handler for retrieving followers or followings of a user along with their profile pictures.
 * @param {object} req - The request object containing user information.
 * @param {object} res - The response object for sending HTTP responses.
 * @param {function} next - The next middleware function in the Express middleware chain.
 * @returns {Promise<void>} A Promise that resolves when the operation is completed.
 */
router.get(
  "/getfriends/:friends",
  authenticate,
  friendsController.getFollowersOrFollowings
);


module.exports = router;
