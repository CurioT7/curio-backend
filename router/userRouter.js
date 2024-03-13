const express = require("express");
const router = express.Router();
const userController = require("../controller/Auth/userController");
const userBlockController = require("../controller/User/blockUserController");


router.post("/auth/signup", userController.signUp);
router.post("/User/block", userBlockController.blockUser);

module.exports = router;