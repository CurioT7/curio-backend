const express = require("express");
const router = express.Router();
const userController = require("../controller/Auth/userController");
const unserBlockController = require("../controller/identity/blockController"); 

router.post("/auth/signup", userController.signUp);

module.exports = router;