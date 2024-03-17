const express = require("express");
const router = express.Router();

const userController = require("../controller/Auth/userController");

router.post("/auth/signup", userController.signUp);

module.exports = router;