const express = require("express");
const router = express.Router();
const postController = require("../controller/post/postController");

// Route to get all comments for a post.
router.get("/comments", postController.getPostComments);

module.exports = router;
