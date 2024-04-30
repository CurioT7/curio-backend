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
const appUserController = require("../controller/Auth/appUserController");
const userBlockController = require("../controller/User/blockUserController");
const contentManagementController = require("../controller/User/contentManagementController");
const { authenticate } = require("../middlewares/auth");

// Set up multer middleware for file uploads
const multer = require("multer");
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },
});

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

router.post("/hide", authenticate, contentManagementController.hidePost);

/**
 * Route to unhide a post.
 * @name POST/User/unhide
 * @function
 * @memberof module:UserRoutes
 * @inner
 * @param {string} path - Express route path
 * @param {Function} middleware - Middleware function for route
 */

router.post("/unhide", authenticate, contentManagementController.unhidePost);
/**
 * Route to spoiler a post.
 * @name POST/User/spoil
 * @function
 * @memberof module:UserRoutes
 * @inner
 * @param {string} path - Express route path
 * @param {Function} middleware - Middleware function for route
 */
router.post("/spoil", contentManagementController.spoilerPost);
/**
 * Route to unspoiler a post.
 * @name POST/User/unspoil
 * @function
 * @memberof module:UserRoutes
 * @inner
 * @param {string} path - Express route path
 * @param {Function} middleware - Middleware function for route
 */
router.post("/unspoil", contentManagementController.unspoilerPost);

/**
 * Route to save a post or comment.
 * @name POST/User/save
 * @function
 * @memberof module:UserRoutes
 * @inner
 * @param {string} path - Express route path
 * @param {Function} middleware - Middleware function for route
 */

router.post("/save", contentManagementController.save);

/*
 * Route to unsave a post or comment.
 * @name POST/User/unsave
 * @function
 * @memberof module:UserRoutes
 * @inner
 * @param {string} path - Express route path
 * @param {Function} middleware - Middleware function for route
 */

router.post("/unsave", contentManagementController.unsave);

/**
 * Route to get saved posts and comments.
 * @name GET/User/saved_categories
 * @function
 * @memberof module:UserRoutes
 * @inner
 * @param {string} path - Express route path
 * @param {Function} middleware - Middleware function for route
 */

router.get("/saved_categories", authenticate, contentManagementController.saved_categories);

/**
 * Route to get hidden posts.
 * @name GET/User/hidden
 * @function
 * @memberof module:UserRoutes
 * @inner
 * @param {string} path - Express route path
 * @param {Function} middleware - Middleware function for route
 */

router.get("/hidden", authenticate, contentManagementController.hidden);

/**
 * Route to submit a post.
 * @name POST/User/submit
 * @function
 * @memberof module:UserRoutes
 * @inner
 * @param {string} path - Express route path
 * @param {Function} middleware - Middleware function for route
 */

router.post(
  "/submit",
  authenticate,
  upload.single("media"),
  contentManagementController.submit
);

/**
 * Route to delete a post.
 * @name DELETE/User/delete
 * @function
 * @memberof module:UserRoutes
 * @inner
 * @param {string} path - Express route path
 */

router.post("/share", authenticate, contentManagementController.sharePost);

/**
 * Route to get a post link.
 * @name GET/User/share/:postId
 * @function
 * @memberof module:UserRoutes
 * @inner
 * @param {string} path - Express route path
 */

router.get("/share/:postId", contentManagementController.getPostLink);

/**
 * Route for locking a post item.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Object} The JSON response indicating success or failure.
 */
router.post("/lock", authenticate, contentManagementController.lockItem);

/**
 * Route for unlocking a post item.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Object} The JSON response indicating success or failure.
 */
router.post("/unlock", authenticate, contentManagementController.unlockItem);

/**
 * Route for retrieving information about a specific item.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Object} The JSON response containing the item information or an error message.
 */
router.get("/info", contentManagementController.getItemInfo);

/**
 * Route handler for casting a vote on a post or a comment.
 * @name POST /vote
 * @function
 * @memberof module:routes/contentManagement
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Object} JSON response indicating success or failure.
 */
router.post("/vote", authenticate, contentManagementController.castVote);

/**
 * Add a post to the user's browsing history.
 * @name POST /history
 * @function
 * @memberof router
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Object} JSON response indicating success or failure.
 */
router.post("/history", authenticate, contentManagementController.addToHistory);

/**
 * Retrieve the user's browsing history.
 * @name GET /getHistory
 * @function
 * @memberof router
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Object} JSON response containing the recent posts.
 */
router.get("/getHistory", authenticate, contentManagementController.getHistory);

/**
 * Delete endpoint to clear user's history.
 * @route DELETE /clear-history
 * @group Content Management - Content management operations
 * @security JWT
 * @returns {object} 200 - Success message
 * @returns {Error}  401 - Unauthorized
 * @returns {Error}  500 - Internal server error
 */
router.delete(
  "/clear-history",
  authenticate,
  contentManagementController.clearHistory
);

/**
 * Retrieve the user's browsing history.
 * @name GET /getHistory
 * @function
 * @memberof router
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Object} JSON response containing the recent posts.
 */

router.get(
  "/subredditOverview/:subreddit?",
  authenticate,
  contentManagementController.subredditOverview
);

/**
 * Route to get the user's saved posts and comments.
 * @name GET /saved
 * @function
 * @memberof router
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Object} JSON response containing the saved posts and comments.
 */

router.post("/pollVote", authenticate, contentManagementController.pollVote);

module.exports = router;
