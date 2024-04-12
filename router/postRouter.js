const express = require("express");
const router = express.Router();
const postController = require("../controller/post/postController");

// Route to get all comments for a post.

router.get("/comments/:postId", postController.getPostComments);

// Route to update comments for a post.
router.patch("/updatecomments", postController.updatePostComments);

// Route to create comments for a post.
router.post("/comments", postController.createComments);

// Route to delete comments for a post.
router.delete("/deletecomments", postController.deleteComments);

module.exports = router;
