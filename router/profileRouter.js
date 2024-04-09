/**
 * Router configuration for profile-related routes.
 * @module router
 * @requires express
 * @requires ProfileController
 */

const express = require("express");
const router = express.Router();
const profileController = require("../controller/profile/profileController");

/**
 * Route serving user posts retrieval.
 * @name get/:username/submitted
 * @function
 * @inner
 * @param {string} path - Express path.
 * @param {callback} middleware - Express middleware.
 */
router.get("/:username/submitted", profileController.getPostsByUser);

/**
 * Route serving retrieval of comments made by a specific user.
 * @name GET /:username/comments
 * @function
 * @inner
 * @param {string} path - Express path.
 * @param {callback} middleware - Express middleware.
 */
router.get("/:username/comments", profileController.getCommentsByUser);

/**
 * Route serving retrieval of upvoted comments and posts made by a specific user.
 * @name GET /:username/upvoted
 * @function
 * @inner
 * @param {string} path - Express path.
 * @param {callback} middleware - Express middleware.
 */
router.get("/upvoted", profileController.getUpvotedContent);

/**
 * Route serving retrieval of downvoted comments and posts made by a specific user.
 * @name GET /:username/downvoted
 * @function
 * @inner
 * @param {string} path - Express path.
 * @param {callback} middleware - Express middleware.
 */
router.get("/downvoted", profileController.getDownvotedContent);

/**
 * Get information about a user.
 * @param {Object} req - The request object.
 * @param {Object} req.params - The parameters sent with the request.
 * @param {string} req.params.username - The username of the user to get information about.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {Object} Information about the user.
 */
router.get("/:username/about", profileController.getAboutInformation);

/**
 * Route handler for fetching overview information about a user.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {void} This function sends a response with overview information about the user.
 */
router.get("/:username/overview", profileController.getOverviewInformation);

/**
 * Route to get joined/moderated communities by a user.
 * @route GET /profile/:username/communities
 * @group User - Operations related to user profiles
 * @param {string} :username.path.required - The username of the user.
 * @returns {object} 200 - An object containing the list of joined/moderated communities.
 * @returns {object} 404 - Not found. Indicates that the user does not exist.
 * @returns {object} 500 - Internal server error. Indicates that an error occurred while fetching user communities.
 */
router.get("/:username/communities", profileController.getJoinedCommunities);

module.exports = router;
