const express = require("express");
const identityController = require("../../controller/identity/identityController");
const router = express.Router();


router.get("/v1/me", identityController.getMe);

module.exports = router;