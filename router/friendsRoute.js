const express = require("express");
const router = express.Router();

const friendsController = require("../controller/friends/friendController");

router.post("/friend", friendsController.followSubreddit);
router.post("/unfriend", friendsController.unFollowSubreddit);
router.post("/me/friends/:username",friendsController.friendRequest);
router.delete("/me/friends/:username", friendsController.unFriendRequest);
router.get("/me/friends/:username", friendsController.getUserInfo);
module.exports = router;