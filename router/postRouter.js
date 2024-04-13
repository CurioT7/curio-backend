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
router.delete("/deletecomments/:commentId", postController.deleteComments);

// Route to delete a post.
router.delete("/deletepost/:postId", postController.deletePost);

// Route to edit post content.
router.patch("/editusertext", postController.editPostContent);

module.exports = router;
