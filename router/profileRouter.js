/**
 * Router configuration for profile-related routes.
 * @module router
 * @requires express
 * @requires ProfileController
 */

const express = require("express");
const router = express.Router();
const ProfileController = require("../controller/profile/profileController");

const profileController = new ProfileController();

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
router.get("/:username/upvoted", profileController.getUpvotedContent);

/**
 * Route serving retrieval of downvoted comments and posts made by a specific user.
 * @name GET /:username/downvoted
 * @function
 * @inner
 * @param {string} path - Express path.
 * @param {callback} middleware - Express middleware.
 */
router.get("/:username/downvoted", profileController.getDownvotedContent);

module.exports = router;
