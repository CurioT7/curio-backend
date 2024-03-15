const express = require("express");
const router = express.Router();

const userController = require("../controller/Auth/userController");
const friendsController = require("../controller/friends/userController");

router.post("/auth/signup", userController.signUp);

module.exports = router;