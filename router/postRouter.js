const express = require("express");
const router = express.Router();
const postController = require("../controller/post/postController");
const { authenticate } = require("../middlewares/auth");
const { auth } = require("google-auth-library");

/**
 * Route to handle GET requests for getting a comments for a post.
 * @name GET/comments
 * @function
 * @memberof module:routes/postRouter
 * @param {string} path - The URL path for the route ("/comments").
 * @param {function} middleware - The controller function to handle the GET request.
 * @returns {object} Express router instance.
 */

router.get("/comments/:postId", (req, res, next) => authenticate(req, res, next, true) , postController.getPostComments);


/**
 * Route to handle PATCH requests for updating comments for a post. 
 * @name PATCH/updatecomments
 * @function
 * @memberof module:routes/postRouter
 * @param {string} path - The URL path for the route ("/updatecomments").
 * @param {function} middleware - The controller function to handle the PATCH request.
 * @returns {object} Express router instance.
 */

router.patch("/updatecomments",authenticate, postController.updatePostComments);


/**
 * Route to handle POST requests for creating comments for a post.
 * @name POST/comments
 * @function
 * @memberof module:routes/postRouter
 * @param {string} path - The URL path for the route ("/comments").
 * @param {function} middleware - The controller function to handle the POST request.
 * @returns {object} Express router instance.
 */
router.post("/comments",authenticate, postController.createComments);


/**
 * Route to handle DELETE requests for deleting comments for a post.
 * @name DELETE/deletecomments
 * @function
 * @memberof module:routes/postRouter
 * @param {string} path - The URL path for the route ("/deletecomments").
 * @param {function} middleware - The controller function to handle the DELETE request.
 * @returns {object} Express router instance.
 */
router.delete("/deletecomments/:commentId",authenticate,postController.deleteComments);


/**
 * Route to handle DELETE requests for deleting a post.
 * @name DELETE/deletepost
 * @function
 * @memberof module:routes/postRouter
 * @param {string} path - The URL path for the route ("/deletepost").
 * @param {function} middleware - The controller function to handle the DELETE request.
 * @returns {object} Express router instance.
 */
router.delete("/deletepost/:postId",authenticate, postController.deletePost);


/**
 * Route to handle PATCH requests for editing post content.
 * @name PATCH/editusertext
 * @function
 * @memberof module:routes/postRouter
 * @param {string} path - The URL path for the route ("/editusertext").
 * @param {function} middleware - The controller function to handle the PATCH request.
 * @returns {object} Express router instance.
 */
router.patch("/editusertext",authenticate,postController.editPostContent);


/**
 * Route to handle POST requests for marking a post as NSFW.
 * @name POST/marknsfw
 * @function
 * @memberof module:routes/postRouter
 * @param {string} path - The URL path for the route ("/marknsfw").
 * @param {function} middleware - The controller function to handle the POST request.
 * @returns {object} Express router instance.
 */
router.post("/marknsfw",authenticate,postController.markPostNSFW);


/**
 * Route to handle POST requests for unmarking a post as NSFW.
 * @name POST/unmarknsfw
 * @function
 * @memberof module:routes/postRouter
 * @param {string} path - The URL path for the route ("/unmarknsfw").
 * @param {function} middleware - The controller function to handle the POST request.
 * @returns {object} Express router instance.
 */
router.post("/unmarknsfw",authenticate, postController.unmarkPostNSFW);

router.post("/scheduledPost",authenticate, postController.scheduledPost);

module.exports = router;
