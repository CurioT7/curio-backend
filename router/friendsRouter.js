const express = require("express");
const router = express.Router();
const friendsController = require("../controller/friends/friendController");

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
 * @name DELETE /me/friends/:username
 * @function
 * @memberof module:routes/friends
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware.
 */
router.delete("/me/friends", friendsController.unFriendRequest);

/**
 * Route to get user information.
 * @name GET /me/friends/:username
 * @function
 * @memberof module:routes/friends
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware.
 */
router.get("/me/friends/:friendUsername", friendsController.getUserInfo);

module.exports = router;
