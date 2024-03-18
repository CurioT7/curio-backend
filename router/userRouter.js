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
router.post("/auth/login", userController.login);
router.get("/auth/username_available/:username", userController.userExist);
router.post("/auth/password", userController.forgotPassword);
router.post("/auth/username", userController.forgotUsername);
router.post("/auth/reset_password/:token", userController.resetPassword);
router.patch("/auth/change_password", userController.changePassword);
router.patch("/auth/change_email", userController.changeEmail);
router.patch("/auth/verify_email/:token", userController.verifyEmail);
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
router.post("/User/unblock", userBlockController.unblockUser);

module.exports = router;
