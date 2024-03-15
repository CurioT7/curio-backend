const express = require("express");
const router = express.Router();

const userController = require("../controller/Auth/userController");
const friendsController = require("../controller/friends/userController");

router.post("/friend", friendsController.followSubreddit);
router.post("/unfriend", friendsController.unFollowSubreddit);
router.post("/me/friends/:username",friendsController.friendRequest);
router.delete("/me/friends/:username", friendsController.unFriendRequest);
router.get("/me/friends/:username", friendsController.getUserInfo);
module.exports = router;