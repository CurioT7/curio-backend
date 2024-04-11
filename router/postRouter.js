const express = require("express");
const router = express.Router();
const postController = require("../controller/post/postController");

/*
 * GET request to retrieve all comments for a post.
 */
router.get("/comments", postController.getPostComments);

module.exports = router;
