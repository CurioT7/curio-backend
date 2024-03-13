const express = require("express");
const router = express.Router();

const userController = require("../controller/Auth/userController");

router.post("/auth/signup", userController.signUp);

router.post("/friend", userController.friendRequest);

router.post("/unfriend", userController.unFriendRequest);

router.get("/me/friends/:username", userController.getUserInfo);

module.exports = router;