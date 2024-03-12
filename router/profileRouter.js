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

module.exports = router;
