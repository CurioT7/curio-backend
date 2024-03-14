const express = require("express");
const router = express.Router();
const passport = require("../passport/passport");

const userController = require("../controller/Auth/userController");

router.post("/auth/signup", userController.signUp);
router.post("/auth/login", userController.login);
router.get("/auth/username_available", userController.userExist);
router.post("/auth/password", userController.forgotPassword);
router.post("/auth/username", userController.forgotUsername);
router.post("/auth/reset_password/:token", userController.resetPassword);
module.exports = router;
