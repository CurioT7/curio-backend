const express = require("express");
const router = express.Router();
const passport = require("passport");

const userController = require("../controller/Auth/userController");

router.post("/auth/signup", userController.signUp);
router.post("/auth/login", userController.login);
router.get("/auth/username_available", userController.userExist);
router.post("/auth/password", userController.forgotPassword);
router.post("/auth/username", userController.forgotUsername);
router.post("/auth/reset_password/:token", userController.resetPassword);
router.patch("/auth/change_password", userController.changePassword);
router.patch("/auth/change_email", userController.changeEmail);
router.patch("/auth/verify_email/:token", userController.verifyEmail);
router.patch("/auth/resend_verification", userController.resendVerification);
module.exports = router;
