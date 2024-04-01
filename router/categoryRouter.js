/**
 * Express router for handling community category-related routes.
 * @module routes/community/categoryRouter
 */

const express = require("express");
const router = express.Router();
const categoryController = require("../controller/community/categoryController");

/**
 * Route to get communities from a specific category.
 * @name GET /api/get_specific_category
 * @function
 * @memberof module:routes/community/categoryRouter
 * @param {string} path - The URL path for the route ("/api/get_specific_category").
 * @param {function} middleware - The controller function to handle the GET request.
 * @returns {object} Express router instance.
 */
router.get(
  "/get_specific_category",
  categoryController.getCommunitiesByCategory
);
/**
 * Route to get communities from a specific category.
 * @name GET /api/random_category
 * @function
 * @memberof module:routes/community/categoryRouter
 * @param {string} path - The URL path for the route ("/api/random_category").
 * @param {function} middleware - The controller function to handle the GET request.
 * @returns {object} Express router instance.
 */

router.get("/random_category", categoryController.getRandomCommunities);

module.exports = router;
