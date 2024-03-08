const express = require("express");
const router = express.Router();

const userController = require("../controller/Auth/userController");

router.post("/auth/signup", userController.signUp);
router.post("/auth/login", userController.login);

module.exports = router;