/**
 * Defines routes related to user authentication and blocking.
 * @module UserRoutes
 * @requires express
 * @requires ../controller/Auth/userController
 * @requires ../controller/User/blockUserController
 */

const express = require("express");
const router = express.Router();
const passport = require("passport");

const userController = require("../controller/Auth/userController");
const appUserController = require("../controller/Auth/appUserController");
const userBlockController = require("../controller/User/blockUserController");
const contentManagementController = require("../controller/User/ContentManagementController");

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
 * Route to log in a user in web
 * @name POST/auth/login
 * @function
 * @memberof module:UserRoutes
 * @inner
 * @param {string} path - Express route path
 * @param {Function} middleware - Middleware function for route
 */
router.post("/auth/login", userController.login);

/**
 * Route to log in a user in app
 * @name POST/auth/app/login
 * @function
 * @memberof module:UserRoutes
 * @inner
 * @param {string} path - Express route path
 * @param {Function} middleware - Middleware function for route
 */

router.post("/auth/app/login", appUserController.appLogin);

/**
 * Route to check if a username is available.
 * @name GET/auth/username_available/:username
 * @function
 * @memberof module:UserRoutes
 * @inner
 * @param {string} path - Express route path
 */
router.get("/auth/username_available/:username", userController.userExist);

/**
 * Route to send a password reset email.
 * @name POST/auth/password
 * @function
 * @memberof module:UserRoutes
 * @inner
 * @param {string} path - Express route path
 * @param {Function} middleware - Middleware function for route
 */
router.post("/auth/password", userController.forgotPassword);

/**
 * Route to send a username reminder email.
 * @name POST/auth/username
 * @function
 * @memberof module:UserRoutes
 * @inner
 * @param {string} path - Express route path
 */
router.post("/auth/username", userController.forgotUsername);

/**
 * Route to reset a user's password.
 * @name POST/auth/reset_password/:token
 * @function
 * @memberof module:UserRoutes
 * @inner
 * @param {string} path - Express route path
 * @param {Function} middleware - Middleware function for route
 */

router.post("/auth/reset_password/:token", userController.resetPassword);

/**
 * Route to change a user's password.
 * @name PATCH/auth/change_password
 * @function
 * @memberof module:UserRoutes
 * @inner
 * @param {string} path - Express route path
 * @param {Function} middleware - Middleware function for route
 */
router.patch("/auth/change_password", userController.changePassword);

/**
 * Route to change a user's email.
 * @name PATCH/auth/change_email
 * @function
 * @memberof module:UserRoutes
 * @inner
 * @param {string} path - Express route path
 * @param {Function} middleware - Middleware function for route
 */
router.patch("/auth/change_email", userController.changeEmail);

/**
 * Route to verify a user's email.
 * @name PATCH/auth/verify_email/:token
 * @function
 * @memberof module:UserRoutes
 * @inner
 * @param {string} path - Express route path
 * @param {Function} middleware - Middleware function for route
 */
router.patch("/auth/verify_email/:token", userController.verifyEmail);

/**
 * Route to resend a user's verification email.
 * @name PATCH/auth/resend_verification
 * @function
 * @memberof module:UserRoutes
 * @inner
 * @param {string} path - Express route path
 * @param {Function} middleware - Middleware function for route
 */
router.patch("/auth/resend_verification", userController.resendVerification);

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

/**
 * Route to unblock a user.
 * @name POST/User/unblock
 * @function
 * @memberof module:UserRoutes
 * @inner
 * @param {string} path - Express route path
 * @param {Function} middleware - Middleware function for route
 */
router.post("/User/unblock", userBlockController.unblockUser);

/**
 * Route to hide a post.
 * @name POST/User/hide
 * @function
 * @memberof module:UserRoutes
 * @inner
 * @param {string} path - Express route path
 * @param {Function} middleware - Middleware function for route
 */

router.post("/hide", contentManagementController.hidePost);

/**
 * Route to unhide a post.
 * @name POST/User/unhide
 * @function
 * @memberof module:UserRoutes
 * @inner
 * @param {string} path - Express route path
 * @param {Function} middleware - Middleware function for route
 */

router.post("/unhide", contentManagementController.unhidePost);

module.exports = router;
