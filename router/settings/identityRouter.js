const express = require("express");
const identityController = require("../../controller/identity/identityController");
const router = express.Router();


router.get("/v1/me", identityController.getMe);
router.get("/v1/me/prefs", identityController.getUserPreferences);
router.patch("/v1/me/prefs", identityController.updateUserPreferences);


module.exports = router;