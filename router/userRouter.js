/**
 * Defines routes related to user authentication and blocking.
 * @module UserRoutes
 * @requires express
 * @requires ../controller/Auth/userController
 * @requires ../controller/User/blockUserController
 */

const express = require("express");
const router = express.Router();
const userController = require("../controller/Auth/userController");
const userBlockController = require("../controller/User/blockUserController");

/**
 * Route to sign up a new user.
 * @name POST/auth/signup
 * @function
 * @memberof module:UserRoutes
 * @inner
 * @param {string} path - Express route path
 * @param {Function} middleware - Middleware function for route
 */

router.post("/auth/signup", userController.signUp);

/**
 * Route to block a user.
 * @name POST/User/block
 * @function
 * @memberof module:UserRoutes
 * @inner
 * @param {string} path - Express route path
 * @param {Function} middleware - Middleware function for route
 */
router.post("/User/block", userBlockController.blockUser);

module.exports = router;